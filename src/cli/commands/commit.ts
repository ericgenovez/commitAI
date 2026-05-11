import inquirer from 'inquirer';
import { gitManager } from '../../core/git';
import { loadConfig } from '../../config/loader';
import { ProviderFactory } from '../../providers/factory';
import { truncateDiff } from '../../utils/truncate';
import { logger } from '../../utils/logger';

export async function commitAction() {
  try {
    const config = loadConfig();

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
    let confirmed = false;

    while (!confirmed) {
      if (!currentMessage) {
        const spinner = logger.spinner(`Gerando mensagem com ${config.provider}...`);
        try {
          currentMessage = await provider.generateCommitMessage(truncatedDiff);
          spinner.succeed('Mensagem gerada!\n');
        } catch (error: any) {
          spinner.fail('Erro ao gerar mensagem.');
          logger.error(error.message);
          return;
        }
      }

      console.log(Buffer.alloc(40, '-').toString());
      console.log(currentMessage);
      console.log(Buffer.alloc(40, '-').toString() + '\n');

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'O que deseja fazer?',
          choices: [
            { name: '✅ Aceitar e commitar', value: 'commit' },
            { name: '✏️ Editar mensagem', value: 'edit' },
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
            message: 'Edite a mensagem de commit:',
            default: currentMessage,
          },
        ]);
        currentMessage = editedMessage;
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
