export interface AIProvider {
  generateCommitMessage(diff: string, context?: string): Promise<string>;
  generatePRDescription(diff: string, sections: string[]): Promise<string>;
}

export interface ProviderOptions {
  apiKey: string;
  model: string;
  language: string;
}
