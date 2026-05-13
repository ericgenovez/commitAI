import inquirer from 'inquirer';
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

import { exec } from 'child_process';
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

export async function prAction(options: { model?: string } = {}) {
  try {
    logger.banner();
    let config = loadConfig();

    if (options.model) {
      config.model = options.model;
    }

    if (!config.apiKey && !process.env.VITEST) {
      logger.warn(t('common.api_key_not_found'));
      const { runInit } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'runInit',
          message: t('common.configure_now'),
          default: true,
        },
      ]);

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
    let step: 'ask_branch' | 'generate' | 'review' | 'edit' | 'done' = 'ask_branch';
    let currentPRDescription = '';
    let currentUsage: any = null;

    while (step !== 'done') {
      if (step === 'ask_branch') {
        const { branch } = await inquirer.prompt([
          {
            type: 'input',
            name: 'branch',
            message: t('pr.branch_question'),
            default: targetBranch,
            validate: (input) => input.trim().length > 0 || t('common.branch_required'),
          },
        ]);
        targetBranch = branch;
        step = 'generate';
      }

      if (step === 'generate') {
        const spinner = logger.spinner(t('pr.diff_fetching', { branch: chalk.cyan(targetBranch) }));
        let diff: string;
        try {
          diff = await gitManager.getBranchDiff(targetBranch);
          if (!diff) {
            spinner.stop();
            const head = await gitManager.getCurrentBranch();
            logger.warn(t('pr.no_changes', { base: targetBranch, head }));
            step = 'ask_branch';
            continue;
          }
          
          spinner.text = t('pr.generating', { provider: chalk.cyan(config.provider) });
          const truncatedDiff = truncateDiff(diff, config.maxDiffLines);
          
          if (diff.split('\n').length > config.maxDiffLines) {
            logger.warn(t('pr.diff_too_large', { lines: diff.split('\n').length, max: config.maxDiffLines }));
          }

          const provider = ProviderFactory.getProvider(config);
          const response = await provider.generatePRDescription(truncatedDiff, config.prTemplate.sections);
          
          currentPRDescription = response.content;
          currentUsage = response.usage;
          spinner.succeed(t('pr.ready') + '\n');
          step = 'review';
        } catch (error: any) {
          spinner.fail(t('pr.fail'));
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
          { name: t('pr.action_copy'), value: 'copy' },
          { name: t('pr.action_browser'), value: 'browser' },
          ...(canUseGH ? [{ name: t('pr.action_gh'), value: 'gh' }] : []),
          { name: t('pr.action_edit'), value: 'edit' },
          { name: t('pr.action_branch'), value: 'ask_branch' },
          { name: t('commit.action_cancel'), value: 'cancel' },
        ];

        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: t('pr.action_question'),
            choices,
          },
        ]);

        // Se for abrir navegador ou GH CLI, verifica se precisa de push
        if (action === 'browser' || action === 'gh') {
          const currentBranch = await gitManager.getCurrentBranch();
          const { confirmPush } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmPush',
              message: t('pr.push_question', { head: currentBranch }),
              default: true,
            },
          ]);

          if (confirmPush) {
            const pushSpinner = logger.spinner(t('pr.pushing'));
            try {
              await gitManager.push();
              pushSpinner.succeed(t('pr.push_success'));
            } catch (error: any) {
              pushSpinner.fail(t('pr.push_fail'));
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
              
              // Normalize URL: converte git@github.com:user/repo.git para https://github.com/user/repo
              let cleanUrl = remoteUrl;
              if (cleanUrl.startsWith('git@')) {
                cleanUrl = 'https://' + cleanUrl.substring(4).replace(':', '/');
              }
              cleanUrl = cleanUrl.replace(/\.git$/, '');

              // Extrai o título baseado na nova regra "TITLE: ..." do prompt
              const titleMatch = currentPRDescription.match(/TITLE: (.*)/i);
              const prTitle = titleMatch ? titleMatch[1].trim() : 'Pull Request';
              
              // Remove a linha do título da descrição final para não ficar duplicado no body
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
            const spinner = logger.spinner(t('pr.gh_creating'));
            try {
              // Salva descrição em arquivo temporário para evitar problemas de escape
              const fs = require('fs');
              const tmpFile = 'pr_desc.tmp';
              fs.writeFileSync(tmpFile, currentPRDescription);
              await execAsync(`gh pr create --base ${targetBranch} --title "PR gerada por CommitAI" --body-file ${tmpFile}`);
              fs.unlinkSync(tmpFile);
              spinner.succeed(t('pr.gh_success'));
              step = 'done';
            } catch (error: any) {
              spinner.fail(t('pr.gh_fail'));
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
            step = 'done';
            break;
        }
      }

      if (step === 'edit') {
        const { editedPR } = await inquirer.prompt([
          {
            type: 'editor',
            name: 'editedPR',
            message: t('pr.edit_prompt'),
            default: currentPRDescription,
          },
        ]);
        if (editedPR && editedPR.trim()) {
          currentPRDescription = editedPR;
        }
        step = 'review';
      }
    }
  } catch (error: any) {
    logger.error(error.message);
  }
}
