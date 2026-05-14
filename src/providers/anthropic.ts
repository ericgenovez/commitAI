import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIResponse, ProviderOptions } from './base';
import { PromptBuilder } from '../core/prompt-builder';
import { Formatter } from '../core/formatter';
import { CommitAIConfig } from '../config/schema';

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private config: ProviderOptions & { projectContext?: string; prSections: string[] };

  constructor(options: ProviderOptions & { projectContext?: string; prSections: string[] }) {
    this.client = new Anthropic({ apiKey: options.apiKey });
    this.config = options;
  }

  async generateCommitMessage(diff: string): Promise<AIResponse> {
    const prompt = PromptBuilder.buildCommitPrompt(diff, {
      language: this.config.language,
      projectContext: this.config.projectContext,
      commitLength: this.config.commitLength,
      emojis: this.config.emojis,
    } as CommitAIConfig);
    
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    const usage = response.usage;

    return {
      content: Formatter.cleanResponse(content),
      usage: usage ? {
        promptTokens: usage.input_tokens,
        completionTokens: usage.output_tokens,
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

    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    const usage = response.usage;

    return {
      content: Formatter.cleanResponse(content),
      usage: usage ? {
        promptTokens: usage.input_tokens,
        completionTokens: usage.output_tokens,
      } : undefined
    };
  }
}
