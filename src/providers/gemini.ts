import { GoogleGenAI } from '@google/genai';
import { AIProvider, AIResponse, ProviderOptions } from './base';
import { PromptBuilder } from '../core/prompt-builder';
import { Formatter } from '../core/formatter';
import { CommitAIConfig } from '../config/schema';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;
  protected config: ProviderOptions & { projectContext?: string; prSections: string[] };

  constructor(options: ProviderOptions & { projectContext?: string; prSections: string[] }) {
    this.client = new GoogleGenAI({ apiKey: options.apiKey });
    this.config = options;
  }

  async generateCommitMessage(diff: string): Promise<AIResponse> {
    const prompt = PromptBuilder.buildCommitPrompt(diff, {
      language: this.config.language,
      projectContext: this.config.projectContext,
      commitLength: this.config.commitLength,
      emojis: this.config.emojis,
    } as CommitAIConfig);

    const response = await this.client.models.generateContent({
      model: this.config.model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return {
      content: Formatter.cleanResponse(response.text || ''),
    };
  }

  async generatePRDescription(diff: string): Promise<AIResponse> {
    const prompt = PromptBuilder.buildPRPrompt(diff, this.config.prSections, this.config.language);

    const response = await this.client.models.generateContent({
      model: this.config.model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return {
      content: Formatter.cleanResponse(response.text || ''),
    };
  }
}
