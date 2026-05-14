import * as p from '@clack/prompts';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../../utils/logger';
import { t } from '../../utils/i18n';

export async function initAction() {
  logger.banner();
  p.intro(t('init.welcome'));

  const location = await p.select({
    message: t('init.location_question'),
    options: [
      { label: t('init.location_global'), value: 'global' },
      { label: t('init.location_local'), value: 'local' },
    ],
  });

  if (p.isCancel(location)) {
    p.cancel(t('common.cancel'));
    process.exit(0);
  }

  const configDir = location === 'global' 
    ? path.join(os.homedir(), '.commitai') 
    : path.resolve(process.cwd(), '.commitai');

  const configPath = path.join(configDir, 'config.json');

  const provider = await p.select({
    message: t('init.provider_question'),
    options: [
      { label: 'OpenAI', value: 'openai' },
      { label: 'Anthropic (Claude)', value: 'anthropic' },
      { label: 'Google (Gemini)', value: 'gemini' },
      { label: 'DeepSeek', value: 'deepseek' },
      { label: 'Ollama (Local)', value: 'ollama' },
    ],
  });

  if (p.isCancel(provider)) {
    p.cancel(t('common.cancel'));
    process.exit(0);
  }

  const apiKey = await p.password({
    message: t('init.apikey_question'),
  });

  if (p.isCancel(apiKey)) {
    p.cancel(t('common.cancel'));
    process.exit(0);
  }

  const cliLanguage = await p.select({
    message: t('init.cli_language_question'),
    initialValue: 'pt-BR',
    options: [
      { label: 'Português (Brasil)', value: 'pt-BR' },
      { label: 'English', value: 'en' },
      { label: 'Español', value: 'es' },
    ],
  });

  if (p.isCancel(cliLanguage)) {
    p.cancel(t('common.cancel'));
    process.exit(0);
  }

  const language = await p.select({
    message: t('init.output_language_question'),
    initialValue: 'pt-BR',
    options: [
      { label: 'Português (Brasil)', value: 'pt-BR' },
      { label: 'English', value: 'en' },
      { label: 'Español', value: 'es' },
    ],
  });

  if (p.isCancel(language)) {
    p.cancel(t('common.cancel'));
    process.exit(0);
  }

  const projectContext = await p.text({
    message: t('init.context_question'),
    placeholder: 'ex: Next.js, TypeScript, Tailwind',
  });

  if (p.isCancel(projectContext)) {
    p.cancel(t('common.cancel'));
    process.exit(0);
  }

  const emojis = await p.confirm({
    message: t('init.emojis_question'),
    initialValue: true,
    active: t('common.yes'),
    inactive: t('common.no'),
  });

  if (p.isCancel(emojis)) {
    p.cancel(t('common.cancel'));
    process.exit(0);
  }

  const commitLength = await p.select({
    message: t('init.length_question'),
    initialValue: 'detailed',
    options: [
      { label: t('init.length_short'), value: 'short' },
      { label: t('init.length_detailed'), value: 'detailed' },
    ],
  });

  if (p.isCancel(commitLength)) {
    p.cancel(t('common.cancel'));
    process.exit(0);
  }

  const config = {
    provider,
    apiKey: apiKey || undefined,
    cliLanguage,
    language,
    projectContext: projectContext || undefined,
    emojis,
    commitLength,
    model: provider === 'openai' ? 'gpt-5-mini' : (provider === 'gemini' ? 'gemini-2.0-flash' : undefined),
  };

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  p.outro(t('init.success', { path: configPath }));
  logger.info(t('init.next_steps'));
}
