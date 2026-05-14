import OpenAI from 'openai';
import { AIProvider, AIResponse, ProviderOptions } from './base';
import { PromptBuilder } from '../core/prompt-builder';
import { Formatter } from '../core/formatter';
import { CommitAIConfig } from '../config/schema';

export class OpenAICompatibleProvider implements AIProvider {
  protected client: OpenAI;
  protected config: ProviderOptions & { projectContext?: string; prSections: string[] };

  constructor(options: ProviderOptions & { projectContext?: string; prSections: string[]; baseURL?: string }) {
    this.client = new OpenAI({ 
      apiKey: options.apiKey,
      baseURL: options.baseURL
    });
    this.config = options;
  }

  async generateCommitMessage(diff: string): Promise<AIResponse> {
    const prompt = PromptBuilder.buildCommitPrompt(diff, {
      language: this.config.language,
      projectContext: this.config.projectContext,
      commitLength: this.config.commitLength,
      emojis: this.config.emojis,
    } as CommitAIConfig);
    
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: this.config.model.includes('gpt-5') ? 1.0 : 0.7,
    });

    const rawContent = response.choices[0].message.content || '';
    const usage = response.usage;

    return {
      content: Formatter.cleanResponse(rawContent),
      usage: usage ? {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
      } : undefined
    };
  }

  async generatePRDescription(diff: string, sections: string[]): Promise<AIResponse> {
    const prompt = PromptBuilder.buildPRPrompt(
      diff,
      sections,
      this.config.language,
      this.config.projectContext,
    );

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: this.config.model.includes('gpt-5') ? 1.0 : 0.7,
    });

    const rawContent = response.choices[0].message.content || '';
    const usage = response.usage;

    return {
      content: Formatter.cleanResponse(rawContent),
      usage: usage ? {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
      } : undefined
    };
  }
}
