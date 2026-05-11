import { OpenAIProvider } from './openai';
import { AIProvider } from './base';
import { CommitAIConfig } from '../config/schema';

export class ProviderFactory {
  static getProvider(config: CommitAIConfig): AIProvider {
    const options = {
      apiKey: config.apiKey || '',
      model: config.model,
      language: config.language,
      projectContext: config.projectContext,
      prSections: config.prTemplate.sections,
    };

    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(options);
      // Os próximos cases serão adicionados conforme implementarmos os providers
      default:
        throw new Error(`Provedor '${config.provider}' ainda não suportado ou não implementado.`);
    }
  }
}
