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

    return `You are an expert developer specializing in Conventional Commits. 
Generate a professional commit message in ${config.language} based on the git diff provided.

STRICT RULES:
1. HEADER: Must be exactly ONE line. Format: <type> <emoji>(<scope>): <subject>
2. SUBJECT: Max 60 characters. Provide a clear, technical summary of the primary change.
3. EMOJIS: Use these EXACTLY (type: emoji):
${emojiRules}
4. BODY: Provide a bulleted list (using "- ") of all significant technical changes included in the diff. 
   - Be descriptive: "Adds validation for email" is better than "Updates validation".
   - Be factual: Only describe what is actually in the diff. Do not invent business reasons or "why" unless it is obvious from the code changes.
5. NEVER provide multiple headers. Only ONE <type> <emoji>(<scope>): <subject> line at the very top.
6. LANGUAGE: All content must be in ${config.language}.
7. NO markdown, NO code blocks, NO chatter.

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
