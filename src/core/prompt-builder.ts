import { CommitAIConfig } from '../config/schema';

export class PromptBuilder {
  private static readonly EMOJI_MAP: Record<string, string> = {
    feat: '✨',
    fix: '🐛',
    docs: '📝',
    style: '💄',
    refactor: '♻️',
    perf: '⚡️',
    test: '🧪',
    build: '🏗️',
    ci: '🤖',
    chore: '🔧',
    revert: '⏪',
    security: '🔒',
    i18n: '🌍',
    release: '🚀',
    wip: '🚧',
    remove: '🗑️',
  };

  static buildCommitPrompt(diff: string, config: CommitAIConfig): string {
    const emojiRules = Object.entries(this.EMOJI_MAP)
      .map(([type, emoji]) => `${type}: ${emoji}`)
      .join('\n');

    return `You are an expert developer. Generate a professional conventional commit message in ${config.language} based on the git diff provided below.

RULES:
1. Format: <type> <emoji>(<scope>): <subject>
2. Use EXACTLY these emojis for each type:
${emojiRules}
3. The emoji MUST be placed between the type and the opening parenthesis of the scope.
4. Subject must be concise (max 50 chars).
5. Provide a body explaining WHY if the change is complex.
6. NO markdown code blocks. NO conversational text.

${config.projectContext ? `PROJECT CONTEXT:\n${config.projectContext}\n` : ''}
GIT DIFF:
${diff}`;
  }

  static buildPRPrompt(diff: string, sections: string[], language: string): string {
    return `Generate a Pull Request description in ${language} for the following diff:
${diff}

Include these sections: ${sections.join(', ')}.
Use professional and clear language.`;
  }
}
