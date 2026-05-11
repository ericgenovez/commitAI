import OpenAI from 'openai';
import { AIProvider, ProviderOptions } from './base';
import { PromptBuilder } from '../core/prompt-builder';
import { Formatter } from '../core/formatter';
import { CommitAIConfig } from '../config/schema';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private config: ProviderOptions & { projectContext?: string; prSections: string[] };

  constructor(options: ProviderOptions & { projectContext?: string; prSections: string[] }) {
    this.client = new OpenAI({ apiKey: options.apiKey });
    this.config = options;
  }

  async generateCommitMessage(diff: string): Promise<string> {
    const prompt = PromptBuilder.buildCommitPrompt(diff, {
      language: this.config.language,
      projectContext: this.config.projectContext,
    } as CommitAIConfig);
    
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const rawContent = response.choices[0].message.content || '';
    return Formatter.cleanResponse(rawContent);
  }

  async generatePRDescription(diff: string): Promise<string> {
    const prompt = PromptBuilder.buildPRPrompt(diff, this.config.prSections, this.config.language);

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const rawContent = response.choices[0].message.content || '';
    return Formatter.cleanResponse(rawContent);
  }
}
