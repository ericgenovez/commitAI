import { gitManager } from '../../core/git';
import { loadConfig } from '../../config/loader';
import { ProviderFactory } from '../../providers/factory';
import { truncateDiff } from '../../utils/truncate';
import { logger } from '../../utils/logger';

export async function commitAction() {
  const spinner = logger.spinner('Iniciando processo de commit...');

  try {
    const config = loadConfig();
    
    if (!(await gitManager.isRepo())) {
      spinner.stop();
      logger.error('Diretório atual não é um repositório Git.');
      return;
    }

    spinner.text = 'Lendo alterações no stage...';
    const diff = await gitManager.getStagedDiff();

    if (!diff) {
      spinner.stop();
      logger.warn('Nenhuma alteração encontrada no stage. Use "git add" primeiro.');
      return;
    }

    const truncatedDiff = truncateDiff(diff, config.maxDiffLines);

    spinner.text = `Gerando mensagem com ${config.provider}...`;
    
    if (!config.apiKey && config.provider !== 'ollama') {
        spinner.stop();
        logger.error('API Key não configurada. Verifique seu arquivo .env ou config.json.');
        return;
    }

    const provider = ProviderFactory.getProvider(config);
    const commitMessage = await provider.generateCommitMessage(truncatedDiff);

    spinner.succeed('Mensagem gerada com sucesso!\n');
    console.log(commitMessage);
    console.log('\n' + Buffer.alloc(40, '-').toString());
    logger.info('Dica: Na próxima fase, você poderá aceitar e commitar automaticamente.');

  } catch (error: any) {
    spinner.fail('Erro ao gerar mensagem de commit.');
    logger.error(error.message);
  }
}
