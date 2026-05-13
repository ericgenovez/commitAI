import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { logger } from '../../utils/logger';
import { ConfigSchema, CommitAIConfig } from '../../config/schema';
import { t } from '../../utils/i18n';

const globalConfigPath = path.join(os.homedir(), '.commitai', 'config.json');
const localConfigPath = path.resolve(process.cwd(), '.commitai', 'config.json');

export async function configAction(
  subcommand?: string,
  key?: string,
  value?: any,
) {
  try {
    if (!subcommand) {
      await interactiveConfig();
      return;
    }

    switch (subcommand) {
      case 'set':
        if (!key || value === undefined) {
          logger.error(t('config.usage_set'));
          return;
        }
        setConfigValue(key, value);
        break;
      case 'get':
        if (!key) {
          logger.error(t('config.usage_get'));
          return;
        }
        getConfigValue(key);
        break;
      case 'list':
        await interactiveConfig();
        break;
      default:
        logger.error(t('config.unknown_subcommand', { subcommand }));
        logger.info(t('config.available_subcommands'));
    }
  } catch (error: any) {
    logger.error(error.message);
  }
}

async function interactiveConfig() {
  const configPath = getActiveConfigPath();
  if (!fs.existsSync(configPath)) {
    logger.warn(t('config.not_found'));
    return;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  logger.info(chalk.bold(t('config.list_title', { path: configPath })) + '\n');

  const { keyToEdit } = await inquirer.prompt([
    {
      type: 'list',
      name: 'keyToEdit',
      message: t('config.select_to_edit'),
      pageSize: 15,
      choices: [
        { name: t('config.setup_ai'), value: 'setup_ai' },
        { name: t('config.change_language'), value: 'change_language' },
        new inquirer.Separator(t('config.other_settings')),
        ...Object.entries(config)
          .filter(
            ([k]) =>
              !['provider', 'model', 'apiKey', 'cliLanguage'].includes(k),
          )
          .map(([key, val]) => {
            const friendlyName = t(`config.label_${key}`) || key;
            const displayValue =
              typeof val === 'object' ? JSON.stringify(val) : val;
            return {
              name: `${chalk.cyan(friendlyName)}: ${chalk.white(displayValue)}`,
              value: key,
            };
          }),
        new inquirer.Separator(),
        { name: t('config.exit'), value: 'exit' },
      ],
    },
  ]);

  if (keyToEdit === 'exit') return;

  if (keyToEdit === 'setup_ai') {
    await setupAIProvider(config);
    return interactiveConfig(); // Recursive call for "Back" behavior
  }

  if (keyToEdit === 'change_language') {
    await changeCLILanguage(config);
    return interactiveConfig(); // Recursive call for "Back" behavior
  }

  let promptConfig: any = {
    name: 'newValue',
    message: t('config.enter_new_value', {
      key: t(`config.label_${keyToEdit}`) || keyToEdit,
    }),
    default: config[keyToEdit],
  };

  // Customize prompt type based on the key
  switch (keyToEdit) {
    case 'language':
      promptConfig.type = 'list';
      promptConfig.choices = [
        { name: 'Português (Brasil)', value: 'pt-BR' },
        { name: 'English', value: 'en' },
        { name: 'Español', value: 'es' },
      ];
      break;
    case 'convention':
      promptConfig.type = 'list';
      promptConfig.choices = [
        { name: 'Conventional Commits', value: 'conventional' },
        { name: 'Angular', value: 'angular' },
        { name: 'Karma', value: 'karma' },
      ];
      break;
    case 'commitLength':
      promptConfig.type = 'list';
      promptConfig.choices = [
        { name: t('init.length_short'), value: 'short' },
        { name: t('init.length_detailed'), value: 'detailed' },
      ];
      break;
    case 'emojis':
      promptConfig.type = 'confirm';
      break;
    case 'maxDiffLines':
      promptConfig.type = 'input';
      promptConfig.validate = (val: string) =>
        !isNaN(Number(val)) || t('common.invalid_input');
      break;
    default:
      promptConfig.type = 'input';
  }

  const { newValue } = await inquirer.prompt([promptConfig]);

  setConfigValue(keyToEdit, newValue);
  return interactiveConfig(); // Return to menu after editing
}

async function setupAIProvider(currentConfig: any) {
  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: t('init.provider_question'),
      default: currentConfig.provider,
      choices: [
        { name: 'OpenAI', value: 'openai' },
        { name: 'Anthropic (Claude)', value: 'anthropic' },
        { name: 'Google (Gemini)', value: 'gemini' },
        { name: 'DeepSeek', value: 'deepseek' },
        { name: 'Ollama (Local)', value: 'ollama' },
      ],
    },
  ]);

  let defaultModel = currentConfig.model;
  if (provider === 'openai') defaultModel = 'gpt-5-mini';
  if (provider === 'gemini') defaultModel = 'gemini-2.5-flash';
  if (provider === 'anthropic') defaultModel = 'claude-3-5-sonnet-latest';

  const { model } = await inquirer.prompt([
    {
      type: 'input',
      name: 'model',
      message: t('config.model_question'),
      default: defaultModel,
    },
  ]);

  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: t('init.apikey_question'),
      mask: '*',
    },
  ]);

  const updates: any = { provider, model };
  if (apiKey) updates.apiKey = apiKey;

  setMultipleConfigValues(updates);
}

async function changeCLILanguage(currentConfig: any) {
  const { cliLanguage } = await inquirer.prompt([
    {
      type: 'list',
      name: 'cliLanguage',
      message: t('init.cli_language_question'),
      default: currentConfig.cliLanguage,
      choices: [
        { name: 'Português (Brasil)', value: 'pt-BR' },
        { name: 'English', value: 'en' },
        { name: 'Español', value: 'es' },
      ],
    },
  ]);

  setConfigValue('cliLanguage', cliLanguage);
}

function setMultipleConfigValues(updates: Record<string, any>) {
  const configPath = getActiveConfigPath();
  const configDir = path.dirname(configPath);

  let currentConfig: any = {};
  if (fs.existsSync(configPath)) {
    currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  const updatedConfig = { ...currentConfig, ...updates };

  // Validate with Zod before saving
  const validation = ConfigSchema.partial().safeParse(updatedConfig);
  if (!validation.success) {
    logger.error(t('config.invalid_value', { key: 'multiple' }));
    validation.error.errors.forEach((err) => logger.error(` - ${err.message}`));
    return;
  }

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
  logger.success(
    t('config.updated', {
      key: Object.keys(updates).join(', '),
      value: '...',
      path: configPath,
    }),
  );
}

function getActiveConfigPath(): string {
  if (fs.existsSync(localConfigPath)) return localConfigPath;
  return globalConfigPath;
}

function setConfigValue(key: string, value: any) {
  const configPath = getActiveConfigPath();
  const configDir = path.dirname(configPath);

  let currentConfig: any = {};
  if (fs.existsSync(configPath)) {
    currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  // Handle typed conversions only if it's a string (from CLI args)
  let typedValue: any = value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') typedValue = true;
    else if (value.toLowerCase() === 'false') typedValue = false;
    else if (!isNaN(Number(value)) && value.trim() !== '')
      typedValue = Number(value);
  }

  const updatedConfig = { ...currentConfig, [key]: typedValue };

  // Validate with Zod before saving
  const validation = ConfigSchema.partial().safeParse(updatedConfig);
  if (!validation.success) {
    logger.error(t('config.invalid_value', { key }));
    validation.error.errors.forEach((err) => logger.error(` - ${err.message}`));
    return;
  }

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
  logger.success(t('config.updated', { key, value, path: configPath }));
}

function getConfigValue(key: string) {
  const configPath = getActiveConfigPath();
  if (!fs.existsSync(configPath)) {
    logger.warn(t('config.not_found'));
    return;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  if (config[key] !== undefined) {
    console.log(config[key]);
  } else {
    logger.warn(t('config.key_not_defined', { key }));
  }
}
