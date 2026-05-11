import { OpenAICompatibleProvider } from './openai-compatible';
import { ProviderOptions } from './base';

export class OllamaProvider extends OpenAICompatibleProvider {
  constructor(options: ProviderOptions & { projectContext?: string; prSections: string[] }) {
    super({
      ...options,
      apiKey: 'ollama',
      baseURL: 'http://localhost:11434/v1',
    });
  }
}
