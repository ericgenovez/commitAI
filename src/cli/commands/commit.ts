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

export async function commitAction(options: { model?: string } = {}) {
  try {
    let config = loadConfig();

    if (options.model) {
      config.model = options.model;
    }

    if (!config.apiKey && !process.env.VITEST) {
      logger.warn('API Key não encontrada.');
      const { runInit } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'runInit',
          message: 'Deseja configurar o CommitAI agora?',
          default: true,
        },
      ]);

      if (runInit) {
        await initAction();
        config = loadConfig();
      } else {
        logger.error('Para usar o CommitAI, você precisa definir uma API Key.');
        return;
      }
    }

    if (!(await gitManager.isRepo())) {
      logger.error('Diretório atual não é um repositório Git.');
      return;
    }

    let diff = await gitManager.getStagedDiff();
    if (!diff) {
      logger.warn('Nenhuma alteração encontrada no stage. Use "git add" primeiro.');
      return;
    }

    // Lógica de "Mentor de Commits" para diffs grandes
    if (diff.split('\n').length > config.maxDiffLines) {
      logger.warn(`O diff total é muito grande (${diff.split('\n').length} linhas).`);
      
      const { shouldFilter } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldFilter',
          message: 'Deseja selecionar arquivos específicos para este commit (recomendado para clareza e economia)?',
          default: true,
        },
      ]);

      if (shouldFilter) {
        const stagedFiles = await gitManager.getStagedFiles();
        const { selectedFiles } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selectedFiles',
            message: 'Selecione os arquivos que farão parte deste commit:',
            choices: stagedFiles,
            validate: (input) => input.length > 0 || 'Selecione ao menos um arquivo.',
          },
        ]);

        const filesToUnstage = stagedFiles.filter(f => !selectedFiles.includes(f));
        if (filesToUnstage.length > 0) {
          const spinner = logger.spinner('Organizando stage...');
          await gitManager.unstageFiles(filesToUnstage);
          diff = await gitManager.getStagedDiff();
          spinner.succeed(`Stage atualizado! ${selectedFiles.length} arquivos mantidos, ${filesToUnstage.length} removidos para o próximo commit.`);
        }
      } else {
        logger.info(chalk.dim(`Prosseguindo com o diff truncado em ${config.maxDiffLines} linhas.`));
      }
    }

    const truncatedDiff = truncateDiff(diff, config.maxDiffLines);
    const provider = ProviderFactory.getProvider(config);

    let currentMessage = '';
    let currentUsage: any = null;
    let step: 'generate' | 'review' | 'edit' | 'done' = 'generate';

    while (step !== 'done') {
      if (step === 'generate') {
        const spinner = logger.spinner(`Gerando sugestão com ${chalk.cyan(config.provider)}...`);
        try {
          const response = await provider.generateCommitMessage(truncatedDiff);
          currentMessage = response.content;
          currentUsage = response.usage;
          spinner.succeed('Sugestão pronta!');
          step = 'review';
        } catch (error: any) {
          spinner.fail('Erro ao gerar mensagem.');
          logger.error(error.message);
          return;
        }
      }

      if (step === 'review') {
        console.log('\n' + boxen(chalk.white(currentMessage), {
          padding: 1,
          margin: { top: 1, bottom: 0 },
          borderStyle: 'round',
          borderColor: 'cyan',
          width: 80,
          title: chalk.bold.cyan(' 💬 Mensagem Sugerida '),
          titleAlignment: 'center',
        }));

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
            message: 'O que deseja fazer?',
            choices: [
              { name: '🚀 Confirmar e Commitar', value: 'commit' },
              { name: '📋 Copiar para o clipboard', value: 'copy' },
              { name: '✍️  Editar manualmente', value: 'edit' },
              { name: '🔄 Gerar novamente', value: 'generate' },
              { name: '❌ Cancelar', value: 'cancel' },
            ],
          },
        ]);

        switch (action) {
          case 'commit':
            await gitManager.commit(currentMessage);
            logger.success('Commit realizado com sucesso!');
            step = 'done';
            break;
          case 'copy':
            await clipboard.copy(currentMessage);
            logger.success('Copiado para o clipboard!');
            break;
          case 'edit':
            step = 'edit';
            break;
          case 'generate':
            currentMessage = '';
            step = 'generate';
            break;
          case 'cancel':
            logger.info('Operação cancelada.');
            step = 'done';
            break;
        }
      }

      if (step === 'edit') {
        const { editedMessage } = await inquirer.prompt([
          {
            type: 'input',
            name: 'editedMessage',
            message: 'Edite a mensagem (ou deixe vazio para voltar):',
            default: currentMessage,
          },
        ]);
        
        if (editedMessage.trim()) {
          currentMessage = editedMessage;
        }
        step = 'review';
      }
    }
  } catch (error: any) {
    logger.error(error.message);
  }
}
