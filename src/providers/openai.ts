import OpenAI from 'openai';
import { AIProvider, ProviderOptions } from './base';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;
  private language: string;

  constructor(options: ProviderOptions) {
    this.client = new OpenAI({ apiKey: options.apiKey });
    this.model = options.model;
    this.language = options.language;
  }

  async generateCommitMessage(diff: string, context?: string): Promise<string> {
    const prompt = this.buildCommitPrompt(diff, context);
    
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0].message.content || '';
  }

  async generatePRDescription(diff: string, sections: string[]): Promise<string> {
    const prompt = this.buildPRPrompt(diff, sections);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0].message.content || '';
  }

  private buildCommitPrompt(diff: string, context?: string): string {
    return `Generate a conventional commit message in ${this.language} for the following diff:
${diff}
${context ? `\nContext: ${context}` : ''}

Rules:
- Use <type>(<scope>): <subject> format
- Use specific emojis per type (feat ✨, fix 🐛, etc.)
- Max 50 characters for the subject line
- Explain the WHY in the body if needed`;
  }

  private buildPRPrompt(diff: string, sections: string[]): string {
    return `Generate a PR description in ${this.language} based on this diff:
${diff}

Include these sections: ${sections.join(', ')}`;
  }
}
