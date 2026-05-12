import inquirer from 'inquirer';
import { gitManager } from '../../core/git';
import { loadConfig } from '../../config/loader';
import { ProviderFactory } from '../../providers/factory';
import { truncateDiff } from '../../utils/truncate';
import { logger } from '../../utils/logger';
import { initAction } from './init';
import { formatUsage, getModelTier } from '../../utils/costs';

export async function commitAction(options: { model?: string } = {}) {
  try {
    let config = loadConfig();

    // Sobrescreve o modelo se passado via CLI
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
        config = loadConfig(); // Reload config after init
      } else {
        logger.error('Para usar o CommitAI, você precisa definir uma API Key.');
        return;
      }
    }

    if (!(await gitManager.isRepo())) {
      logger.error('Diretório atual não é um repositório Git.');
      return;
    }

    const diff = await gitManager.getStagedDiff();
    if (!diff) {
      logger.warn('Nenhuma alteração encontrada no stage. Use "git add" primeiro.');
      return;
    }

    const truncatedDiff = truncateDiff(diff, config.maxDiffLines);
    const provider = ProviderFactory.getProvider(config);

    let currentMessage = '';
    let currentUsage: any = null;
    let confirmed = false;

    while (!confirmed) {
      if (!currentMessage) {
        const spinner = logger.spinner(`Gerando mensagem com ${config.provider}...`);
        try {
          const response = await provider.generateCommitMessage(truncatedDiff);
          currentMessage = response.content;
          currentUsage = response.usage;
          spinner.succeed('Mensagem gerada!\n');
        } catch (error: any) {
          spinner.fail('Erro ao gerar mensagem.');
          logger.error(error.message);
          return;
        }
      }

      console.log(Buffer.alloc(40, '-').toString());
      console.log(currentMessage);
      console.log(Buffer.alloc(40, '-').toString());

      if (currentUsage) {
        const usageText = formatUsage({
          promptTokens: currentUsage.promptTokens,
          completionTokens: currentUsage.completionTokens,
        });
        console.log(`📊 ${usageText}`);
        console.log(`🏷️  ${getModelTier(config.model)}\n`);
      } else {
        console.log('');
      }

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'O que deseja fazer?',
          choices: [
            { name: '✅ Aceitar e commitar', value: 'commit' },
            { name: '✍️  Escrever manualmente', value: 'edit' },
            { name: '🔄 Regenerar', value: 'regenerate' },
            { name: '❌ Cancelar', value: 'cancel' },
          ],
        },
      ]);

      if (action === 'commit') {
        await gitManager.commit(currentMessage);
        logger.success('Commit realizado com sucesso!');
        confirmed = true;
      } else if (action === 'edit') {
        const { editedMessage } = await inquirer.prompt([
          {
            type: 'input',
            name: 'editedMessage',
            message: 'Digite a nova mensagem de commit:',
          },
        ]);
        
        if (editedMessage.trim()) {
          currentMessage = editedMessage;
        }
      } else if (action === 'regenerate') {
        currentMessage = ''; // Limpa para forçar uma nova geração no próximo loop
      } else if (action === 'cancel') {
        logger.info('Operação cancelada.');
        confirmed = true;
      }
    }
  } catch (error: any) {
    logger.error(error.message);
  }
}
