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
import boxen from 'boxen';
import { t } from '../../utils/i18n';

export async function commitAction(options: { model?: string } = {}) {
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
      
      const { shouldFilter } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldFilter',
          message: t('commit.filter_question'),
          default: true,
        },
      ]);

      if (shouldFilter) {
        const stagedFiles = await gitManager.getStagedFiles();
        const { selectedFiles } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selectedFiles',
            message: t('commit.select_files'),
            choices: stagedFiles,
            validate: (input) => input.length > 0 || t('common.select_at_least_one'),
          },
        ]);

        const filesToUnstage = stagedFiles.filter(f => !selectedFiles.includes(f));
        if (filesToUnstage.length > 0) {
          const spinner = logger.spinner(t('commit.unstage_spinner'));
          await gitManager.unstageFiles(filesToUnstage);
          diff = await gitManager.getStagedDiff();
          spinner.succeed(t('commit.unstage_success', { selected: selectedFiles.length, removed: filesToUnstage.length }));
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
        const spinner = logger.spinner(t('commit.generating', { provider: chalk.cyan(config.provider) }));
        try {
          const response = await provider.generateCommitMessage(truncatedDiff);
          currentMessage = response.content;
          currentUsage = response.usage;
          spinner.succeed(t('commit.ready'));
          step = 'review';
        } catch (error: any) {
          spinner.fail(t('commit.fail'));
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

        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: t('commit.action_question'),
            choices: [
              { name: t('commit.action_commit'), value: 'commit' },
              { name: t('commit.action_copy'), value: 'copy' },
              { name: t('commit.action_edit'), value: 'edit' },
              { name: t('commit.action_generate'), value: 'generate' },
              { name: t('commit.action_cancel'), value: 'cancel' },
            ],
          },
        ]);

        switch (action) {
          case 'commit':
            await gitManager.commit(currentMessage);
            logger.success(t('commit.commit_success'));
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
            logger.info(t('commit.cancel_info'));
            step = 'done';
            break;
        }
      }

      if (step === 'edit') {
        const { editedMessage } = await inquirer.prompt([
          {
            type: 'editor',
            name: 'editedMessage',
            message: t('commit.edit_prompt'),
            default: currentMessage,
          },
        ]);
        
        if (editedMessage && editedMessage.trim()) {
          currentMessage = editedMessage;
        }
        step = 'review';
      }
    }
  } catch (error: any) {
    logger.error(error.message);
  }
}
