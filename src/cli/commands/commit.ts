import { gitManager } from '../../core/git';
import { loadConfig } from '../../config/loader';
import { OpenAIProvider } from '../../providers/openai';
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
    
    // Por enquanto apenas OpenAI, depois faremos uma factory de providers
    if (config.provider !== 'openai') {
        spinner.stop();
        logger.error(`Provedor ${config.provider} ainda não implementado.`);
        return;
    }

    if (!config.apiKey) {
        spinner.stop();
        logger.error('API Key não configurada. Verifique seu arquivo .env ou config.json.');
        return;
    }

    const provider = new OpenAIProvider({
      apiKey: config.apiKey,
      model: config.model,
      language: config.language,
      projectContext: config.projectContext,
      prSections: config.prTemplate.sections
    });

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
