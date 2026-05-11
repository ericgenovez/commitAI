import { OpenAICompatibleProvider } from './openai-compatible';
import { ProviderOptions } from './base';

export class DeepSeekProvider extends OpenAICompatibleProvider {
  constructor(options: ProviderOptions & { projectContext?: string; prSections: string[] }) {
    super({
      ...options,
      baseURL: 'https://api.deepseek.com',
    });
  }
}
