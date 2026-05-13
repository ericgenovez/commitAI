import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../../utils/logger';
import { t } from '../../utils/i18n';

export async function initAction() {
  logger.info(t('init.welcome') + '\n');

  const { location } = await inquirer.prompt([
    {
      type: 'list',
      name: 'location',
      message: t('init.location_question'),
      choices: [
        { name: t('init.location_global'), value: 'global' },
        { name: t('init.location_local'), value: 'local' },
      ],
    },
  ]);

  const configDir = location === 'global' 
    ? path.join(os.homedir(), '.commitai') 
    : path.resolve(process.cwd(), '.commitai');

  const configPath = path.join(configDir, 'config.json');

  const { provider, apiKey, cliLanguage, language, emojis, commitLength } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: t('init.provider_question'),
      choices: [
        { name: 'OpenAI', value: 'openai' },
        { name: 'Anthropic (Claude)', value: 'anthropic' },
        { name: 'DeepSeek', value: 'deepseek' },
        { name: 'Ollama (Local)', value: 'ollama' },
      ],
    },
    {
      type: 'password',
      name: 'apiKey',
      message: t('init.apikey_question'),
      mask: '*',
    },
    {
      type: 'list',
      name: 'cliLanguage',
      message: t('init.cli_language_question'),
      choices: [
        { name: 'Português (Brasil)', value: 'pt-BR' },
        { name: 'English', value: 'en' },
        { name: 'Español', value: 'es' },
      ],
      default: 'pt-BR',
    },
    {
      type: 'list',
      name: 'language',
      message: t('init.output_language_question'),
      choices: [
        { name: 'Português (Brasil)', value: 'pt-BR' },
        { name: 'English', value: 'en' },
        { name: 'Español', value: 'es' },
      ],
      default: 'pt-BR',
    },
    {
      type: 'confirm',
      name: 'emojis',
      message: t('init.emojis_question'),
      default: true,
    },
    {
      type: 'list',
      name: 'commitLength',
      message: t('init.length_question'),
      choices: [
        { name: t('init.length_short'), value: 'short' },
        { name: t('init.length_detailed'), value: 'detailed' },
      ],
      default: 'detailed',
    },
  ]);

  const config = {
    provider,
    apiKey: apiKey || undefined,
    cliLanguage,
    language,
    emojis,
    commitLength,
    model: provider === 'openai' ? 'gpt-5-mini' : undefined, // Defaults depend on provider
  };

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  logger.success(t('init.success', { path: configPath }));
  logger.info(t('init.next_steps'));
}
