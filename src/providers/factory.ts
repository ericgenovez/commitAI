import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { DeepSeekProvider } from './deepseek';
import { OllamaProvider } from './ollama';
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
      commitLength: config.commitLength,
      emojis: config.emojis,
    };

    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(options);
      case 'anthropic':
        return new AnthropicProvider(options);
      case 'deepseek':
        return new DeepSeekProvider(options);
      case 'ollama':
        return new OllamaProvider(options);
      default:
        throw new Error(`Provedor '${config.provider}' ainda não suportado ou não implementado.`);
    }
  }
}
