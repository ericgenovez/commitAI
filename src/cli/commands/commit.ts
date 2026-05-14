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
import boxen from 'boxen';
import { t } from '../../utils/i18n';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

async function editInExternalEditor(initialContent: string): Promise<string> {
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `commitai_edit_${Date.now()}.txt`);
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

export async function commitAction(options: { model?: string } = {}) {
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
      logger.error(t('commit.not_repo'));
      return;
    }

    let diff = await gitManager.getStagedDiff();
    if (!diff) {
      logger.warn(t('commit.no_diff'));
      return;
    }

    // Lógica de "Mentor de Commits" para diffs grandes
    if (diff.split('\n').length > config.maxDiffLines) {
      logger.warn(t('commit.diff_too_large', { lines: diff.split('\n').length }));
      
      const shouldFilter = await p.confirm({
        message: t('commit.filter_question'),
        initialValue: true,
        active: t('common.yes'),
        inactive: t('common.no'),
      });

      if (p.isCancel(shouldFilter)) return;

      if (shouldFilter) {
        const stagedFiles = await gitManager.getStagedFiles();
        const selectedFiles = await p.multiselect({
          message: t('commit.select_files'),
          options: stagedFiles.map(f => ({ label: f, value: f })),
          required: true,
        });

        if (p.isCancel(selectedFiles)) return;

        const filesToUnstage = stagedFiles.filter(f => !(selectedFiles as string[]).includes(f));
        if (filesToUnstage.length > 0) {
          const s = p.spinner();
          s.start(t('commit.unstage_spinner'));
          await gitManager.unstageFiles(filesToUnstage);
          diff = await gitManager.getStagedDiff();
          s.stop(t('commit.unstage_success', { selected: (selectedFiles as string[]).length, removed: filesToUnstage.length }));
        }
      } else {
        logger.info(chalk.dim(t('commit.proceed_truncated', { max: config.maxDiffLines })));
      }
    }

    const truncatedDiff = truncateDiff(diff, config.maxDiffLines);
    const provider = ProviderFactory.getProvider(config);

    let currentMessage = '';
    let currentUsage: any = null;
    let step: 'generate' | 'review' | 'edit' | 'done' = 'generate';

    while (step !== 'done') {
      if (step === 'generate') {
        const s = p.spinner();
        s.start(t('commit.generating', { provider: chalk.cyan(config.provider) }));
        try {
          const response = await provider.generateCommitMessage(truncatedDiff);
          currentMessage = response.content;
          currentUsage = response.usage;
          s.stop(t('commit.ready'));
          step = 'review';
        } catch (error: any) {
          s.stop(t('commit.fail'), 1);
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

        const borderColor = providerColors[config.provider] || 'cyan';

        console.log(
          '\n' +
            boxen(chalk.white(currentMessage), {
              padding: 1,
              margin: { top: 1, bottom: 0, left: 0, right: 0 },
              borderStyle: 'round',
              borderColor: borderColor,
              title: chalk.bold(t('commit.suggested_message_title')),
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

        const action = await p.select({
          message: t('commit.action_question'),
          options: [
            { label: t('commit.action_commit'), value: 'commit' },
            { label: t('commit.action_copy'), value: 'copy' },
            { label: t('commit.action_edit'), value: 'edit' },
            { label: t('commit.action_generate'), value: 'generate' },
            { label: chalk.red(t('commit.action_cancel')), value: 'cancel' },
          ],
        });

        if (p.isCancel(action)) {
          step = 'done';
          continue;
        }

        switch (action) {
          case 'commit':
            await gitManager.commit(currentMessage);
            p.outro(t('commit.commit_success'));
            step = 'done';
            break;
          case 'copy':
            await clipboard.copy(currentMessage);
            logger.success(t('commit.copy_success'));
            break;
          case 'edit':
            step = 'edit';
            break;
          case 'generate':
            currentMessage = '';
            step = 'generate';
            break;
          case 'cancel':
            p.outro(t('commit.cancel_info'));
            step = 'done';
            break;
        }
      }

      if (step === 'edit') {
        const editedMessage = await editInExternalEditor(currentMessage);
        if (editedMessage) {
          currentMessage = editedMessage;
        }
        step = 'review';
      }
    }
  } catch (error: any) {
    logger.error(error.message);
  }
}
