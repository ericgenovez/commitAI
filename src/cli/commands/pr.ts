import * as p from '@clack/prompts';
import { gitManager } from '../../core/git';
import { loadConfig } from '../../config/loader';
import { ProviderFactory } from '../../providers/factory';
import { truncateDiff } from '../../utils/truncate';
import { logger } from '../../utils/logger';
import { clipboard } from '../../utils/clipboard';
import { initAction } from './init';
import { formatUsage, getModelTier } from '../../utils/costs';
import chalk from 'chalk';
import { openInBrowser } from '../../utils/open';
import boxen from 'boxen';
import { t } from '../../utils/i18n';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function hasGitHubCLI() {
  try {
    await execAsync('gh --version');
    return true;
  } catch {
    return false;
  }
}

async function editInExternalEditor(initialContent: string): Promise<string> {
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `commitai_pr_edit_${Date.now()}.txt`);
  fs.writeFileSync(tempFile, initialContent);

  const editor = process.env.EDITOR || 'vi';

  return new Promise((resolve) => {
    const child = spawn(editor, [tempFile], { stdio: 'inherit' });
    child.on('exit', () => {
      const editedContent = fs.readFileSync(tempFile, 'utf-8');
      fs.unlinkSync(tempFile);
      resolve(editedContent.trim());
    });
  });
}

export async function prAction(options: { model?: string } = {}) {
  try {
    logger.banner();
    let config = loadConfig();

    if (options.model) {
      config.model = options.model;
    }

    if (!config.apiKey && !process.env.VITEST) {
      logger.warn(t('common.api_key_not_found'));
      const runInit = await p.confirm({
        message: t('common.configure_now'),
        initialValue: true,
        active: t('common.yes'),
        inactive: t('common.no'),
      });

      if (p.isCancel(runInit)) return;

      if (runInit) {
        await initAction();
        config = loadConfig();
      } else {
        logger.error(t('common.api_key_required'));
        return;
      }
    }

    if (!(await gitManager.isRepo())) {
      logger.error(t('pr.not_repo'));
      return;
    }

    let targetBranch = 'main';
    let step: 'ask_branch' | 'select_sections' | 'generate' | 'review' | 'edit' | 'done' = 'ask_branch';
    let currentPRDescription = '';
    let currentUsage: any = null;
    let selectedSections: string[] = config.prTemplate.sections;

    while (step !== 'done') {
      if (step === 'ask_branch') {
        const branch = await p.text({
          message: t('pr.branch_question'),
          initialValue: targetBranch,
          validate: (input) => input.trim().length > 0 ? undefined : t('common.branch_required'),
        });

        if (p.isCancel(branch)) return;
        targetBranch = branch as string;
        step = 'select_sections';
      }

      if (step === 'select_sections') {
        const sections = await p.multiselect({
          message: t('pr.sections_question'),
          options: [
            { label: t('pr.section_what'), value: 'what' },
            { label: t('pr.section_why'), value: 'why' },
            { label: t('pr.section_how_to_test'), value: 'how-to-test' },
            { label: t('pr.section_screenshots'), value: 'screenshots' },
          ],
          initialValues: ['what', 'why', 'how-to-test'],
        });

        if (p.isCancel(sections)) {
          step = 'ask_branch';
          continue;
        }

        selectedSections = sections as string[];
        step = 'generate';
      }

      if (step === 'generate') {
        const s = p.spinner();
        s.start(t('pr.diff_fetching', { branch: chalk.cyan(targetBranch) }));
        let diff: string;
        try {
          diff = await gitManager.getBranchDiff(targetBranch);
          if (!diff) {
            s.stop(t('pr.fail'), 1);
            const head = await gitManager.getCurrentBranch();
            logger.warn(t('pr.no_changes', { base: targetBranch, head }));
            step = 'ask_branch';
            continue;
          }
          
          s.message(t('pr.generating', { provider: chalk.cyan(config.provider) }));
          const truncatedDiff = truncateDiff(diff, config.maxDiffLines);
          
          if (diff.split('\n').length > config.maxDiffLines) {
            logger.warn(t('pr.diff_too_large', { lines: diff.split('\n').length, max: config.maxDiffLines }));
          }

          const provider = ProviderFactory.getProvider(config);
          const response = await provider.generatePRDescription(truncatedDiff, selectedSections);
          
          currentPRDescription = response.content;
          currentUsage = response.usage;
          s.stop(t('pr.ready'));
          step = 'review';
        } catch (error: any) {
          s.stop(t('pr.fail'), 1);
          logger.error(error.message);
          return;
        }
      }

      if (step === 'review') {
        const providerColors: Record<string, string> = {
          openai: '#74aa9c',
          anthropic: '#d97757',
          gemini: '#4285f4',
          deepseek: '#606bc7',
          ollama: '#ffffff',
        };

        const borderColor = providerColors[config.provider] || 'magenta';

        console.log(
          '\n' +
            boxen(chalk.white(currentPRDescription), {
              padding: 1,
              margin: { top: 1, bottom: 0, left: 0, right: 0 },
              borderStyle: 'round',
              borderColor: borderColor,
              title: chalk.bold(t('pr.suggested_description_title')),
              titleAlignment: 'center',
            }),
        );

        if (currentUsage) {
          const usageText = formatUsage({
            promptTokens: currentUsage.promptTokens,
            completionTokens: currentUsage.completionTokens,
          });
          console.log(chalk.dim(`  📊 ${usageText} | 🏷️  ${getModelTier(config.model)}\n`));
        }

        const canUseGH = await hasGitHubCLI();
        const choices = [
          { label: t('pr.action_copy'), value: 'copy' },
          { label: t('pr.action_browser'), value: 'browser' },
          ...(canUseGH ? [{ label: t('pr.action_gh'), value: 'gh' }] : []),
          { label: t('pr.action_edit'), value: 'edit' },
          { label: t('pr.action_branch'), value: 'ask_branch' },
          { label: chalk.red(t('commit.action_cancel')), value: 'cancel' },
        ];

        const action = await p.select({
          message: t('pr.action_question'),
          options: choices,
        });

        if (p.isCancel(action)) {
          step = 'done';
          continue;
        }

        // Se for abrir navegador ou GH CLI, verifica se precisa de push
        if (action === 'browser' || action === 'gh') {
          const currentBranch = await gitManager.getCurrentBranch();
          const confirmPush = await p.confirm({
            message: t('pr.push_question', { head: currentBranch }),
            initialValue: true,
            active: t('common.yes'),
            inactive: t('common.no'),
          });

          if (p.isCancel(confirmPush)) continue;

          if (confirmPush) {
            const s = p.spinner();
            s.start(t('pr.pushing'));
            try {
              await gitManager.push();
              s.stop(t('pr.push_success'));
            } catch (error: any) {
              s.stop(t('pr.push_fail'), 1);
              logger.error(error.message);
              continue; // Volta para o menu de review
            }
          }
        }

        switch (action) {
          case 'copy':
            await clipboard.copy(currentPRDescription);
            logger.success(t('commit.copy_success'));
            break;
          case 'browser':
            const remoteUrl = await gitManager.getRemoteUrl();
            if (remoteUrl) {
              const currentBranch = await gitManager.getCurrentBranch();
              
              let cleanUrl = remoteUrl;
              if (cleanUrl.startsWith('git@')) {
                cleanUrl = 'https://' + cleanUrl.substring(4).replace(':', '/');
              }
              cleanUrl = cleanUrl.replace(/\.git$/, '');

              const titleMatch = currentPRDescription.match(/TITLE: (.*)/i);
              const prTitle = titleMatch ? titleMatch[1].trim() : 'Pull Request';
              
              const cleanDescription = currentPRDescription.replace(/TITLE: .*\n?/i, '').trim();
              
              let prUrl = '';
              if (cleanUrl.includes('github.com')) {
                const encodedTitle = encodeURIComponent(prTitle);
                const encodedBody = encodeURIComponent(cleanDescription);
                prUrl = `${cleanUrl}/compare/${targetBranch}...${currentBranch}?expand=1&title=${encodedTitle}&body=${encodedBody}`;
              } else if (cleanUrl.includes('gitlab.com')) {
                const encodedTitle = encodeURIComponent(prTitle);
                const encodedBody = encodeURIComponent(cleanDescription);
                prUrl = `${cleanUrl}/-/merge_requests/new?merge_request[source_branch]=${currentBranch}&merge_request[target_branch]=${targetBranch}&merge_request[title]=${encodedTitle}&merge_request[description]=${encodedBody}`;
              }
              if (prUrl) {
                await clipboard.copy(currentPRDescription);
                logger.info(t('pr.copy_info'));
                await openInBrowser(prUrl);
                logger.success(t('pr.browser_success'));
                step = 'done';
              }
            }
            break;
          case 'gh':
            const s = p.spinner();
            s.start(t('pr.gh_creating'));
            try {
              const tmpFile = path.join(os.tmpdir(), `pr_desc_${Date.now()}.tmp`);
              fs.writeFileSync(tmpFile, currentPRDescription);
              await execAsync(`gh pr create --base ${targetBranch} --title "PR gerada por CommitAI" --body-file ${tmpFile}`);
              fs.unlinkSync(tmpFile);
              s.stop(t('pr.gh_success'));
              step = 'done';
            } catch (error: any) {
              s.stop(t('pr.gh_fail'), 1);
              logger.error(error.message);
            }
            break;
          case 'edit':
            step = 'edit';
            break;
          case 'ask_branch':
            step = 'ask_branch';
            break;
          case 'cancel':
            p.outro(t('common.cancel_info'));
            step = 'done';
            break;
        }
      }

      if (step === 'edit') {
        const editedPR = await editInExternalEditor(currentPRDescription);
        if (editedPR) {
          currentPRDescription = editedPR;
        }
        step = 'review';
      }
    }
  } catch (error: any) {
    logger.error(error.message);
  }
}
