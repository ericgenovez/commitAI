export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface AIProvider {
  generateCommitMessage(diff: string, context?: string): Promise<AIResponse>;
  generatePRDescription(diff: string, sections: string[]): Promise<AIResponse>;
}

export interface ProviderOptions {
  apiKey: string;
  model: string;
  language: string;
  commitLength?: 'short' | 'detailed';
  emojis?: boolean;
}
