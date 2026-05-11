import inquirer from 'inquirer';
import { gitManager } from '../../core/git';
import { loadConfig } from '../../config/loader';
import { ProviderFactory } from '../../providers/factory';
import { truncateDiff } from '../../utils/truncate';
import { logger } from '../../utils/logger';
import { clipboard } from '../../utils/clipboard';

export async function prAction() {
  try {
    const config = loadConfig();

    if (!(await gitManager.isRepo())) {
      logger.error('Diretório atual não é um repositório Git.');
      return;
    }

    const { targetBranch } = await inquirer.prompt([
      {
        type: 'input',
        name: 'targetBranch',
        message: 'Qual a branch de destino (target branch)?',
        default: 'main',
      },
    ]);

    const spinner = logger.spinner(`Obtendo diff com a branch ${targetBranch}...`);
    let diff: string;
    try {
      diff = await gitManager.getBranchDiff(targetBranch);
    } catch (error: any) {
      spinner.fail('Erro ao obter diff.');
      logger.error(error.message);
      return;
    }

    if (!diff) {
      spinner.stop();
      logger.warn('Nenhuma diferença encontrada entre as branches.');
      return;
    }

    const truncatedDiff = truncateDiff(diff, config.maxDiffLines);
    const provider = ProviderFactory.getProvider(config);

    let currentPRDescription = '';
    let confirmed = false;

    while (!confirmed) {
      if (!currentPRDescription) {
        spinner.start(`Gerando descrição de PR com ${config.provider}...`);
        try {
          currentPRDescription = await provider.generatePRDescription(truncatedDiff);
          spinner.succeed('Descrição gerada!\n');
        } catch (error: any) {
          spinner.fail('Erro ao gerar descrição.');
          logger.error(error.message);
          return;
        }
      }

      console.log(Buffer.alloc(40, '-').toString());
      console.log(currentPRDescription);
      console.log(Buffer.alloc(40, '-').toString() + '\n');

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'O que deseja fazer?',
          choices: [
            { name: '✅ Copiar para o clipboard', value: 'copy' },
            { name: '✍️  Reescrever manualmente', value: 'edit' },
            { name: '🔄 Regenerar', value: 'regenerate' },
            { name: '❌ Cancelar', value: 'cancel' },
          ],
        },
      ]);

      if (action === 'copy') {
        try {
          await clipboard.copy(currentPRDescription);
          logger.success('Descrição copiada para o clipboard!');
          confirmed = true;
        } catch (error: any) {
          logger.error('Falha ao copiar: ' + error.message);
        }
      } else if (action === 'edit') {
        const { editedPR } = await inquirer.prompt([
          {
            type: 'input',
            name: 'editedPR',
            message: 'Digite a nova descrição do PR:',
          },
        ]);
        if (editedPR.trim()) {
          currentPRDescription = editedPR;
        }
      } else if (action === 'regenerate') {
        currentPRDescription = '';
      } else if (action === 'cancel') {
        logger.info('Operação cancelada.');
        confirmed = true;
      }
    }
  } catch (error: any) {
    logger.error(error.message);
  }
}
