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
    const emojiRules = config.emojis 
      ? `3. EMOJIS: Use these EXACTLY (type: emoji):\n${Object.entries(this.EMOJI_MAP).map(([type, emoji]) => `${type}: ${emoji}`).join('\n')}`
      : '3. EMOJIS: DO NOT use any emojis in the commit message.';

    const bodyRule = config.commitLength === 'short'
      ? '4. BODY: DO NOT provide a body. Return ONLY the header line.'
      : `4. BODY: Provide a bulleted list (using "- ") of all significant technical changes included in the diff.
   - Be descriptive: "Adds validation for email" is better than "Updates validation".
   - Be factual: Only describe what is actually in the diff. Do not invent business reasons or "why" unless it is obvious from the code changes.`;

    const headerFormat = config.emojis
      ? '<type> <emoji>(<scope>): <subject>'
      : '<type>(<scope>): <subject>';

    return `You are an expert developer specializing in Conventional Commits. 
Generate a professional commit message in ${config.language} based on the git diff provided.

STRICT RULES:
1. HEADER: Must be exactly ONE line. Format: ${headerFormat}
2. SUBJECT: Max 60 characters. Provide a clear, technical summary of the primary change.
${emojiRules}
${bodyRule}
5. NEVER provide multiple headers. Only ONE ${headerFormat} line at the very top.
6. LANGUAGE: All content must be in ${config.language}.
7. NO markdown, NO code blocks, NO chatter.

${config.projectContext ? `PROJECT CONTEXT:\n${config.projectContext}\n` : ''}
GIT DIFF:
${diff}`;
  }

  static buildPRPrompt(diff: string, sections: string[], language: string): string {
    return `You are an expert developer. Generate a professional Pull Request description in ${language} for the following diff:
${diff}

STRICT RULES:
1. START with a line: "TITLE: <concise and meaningful title>"
2. Follow with the sections: ${sections.join(', ')}.
3. DO NOT use generic titles like "Descrição do PR" or "Pull Request". Be specific about what changed in the title.
4. Use Markdown for formatting the body.
5. Use professional and clear language.`;
  }
}
