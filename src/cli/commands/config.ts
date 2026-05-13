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

export async function configAction(subcommand?: string, key?: string, value?: any) {
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
      pageSize: 10,
      choices: [
        ...Object.entries(config).map(([key, val]) => ({
          name: `${chalk.cyan(key)}: ${chalk.white(val)}`,
          value: key
        })),
        new inquirer.Separator(),
        { name: t('config.exit'), value: 'exit' }
      ]
    }
  ]);

  if (keyToEdit === 'exit') return;

  let promptConfig: any = {
    name: 'newValue',
    message: t('config.enter_new_value', { key: keyToEdit }),
    default: config[keyToEdit]
  };

  // Customize prompt type based on the key
  switch (keyToEdit) {
    case 'provider':
      promptConfig.type = 'list';
      promptConfig.choices = [
        { name: 'OpenAI', value: 'openai' },
        { name: 'Anthropic', value: 'anthropic' },
        { name: 'DeepSeek', value: 'deepseek' },
        { name: 'Ollama', value: 'ollama' }
      ];
      break;
    case 'language':
      promptConfig.type = 'list';
      promptConfig.choices = [
        { name: 'Português (Brasil)', value: 'pt-BR' },
        { name: 'English', value: 'en' },
        { name: 'Español', value: 'es' }
      ];
      break;
    case 'commitLength':
      promptConfig.type = 'list';
      promptConfig.choices = [
        { name: t('init.length_short'), value: 'short' },
        { name: t('init.length_detailed'), value: 'detailed' }
      ];
      break;
    case 'emojis':
      promptConfig.type = 'confirm';
      break;
    case 'maxDiffLines':
      promptConfig.type = 'input';
      promptConfig.validate = (val: string) => !isNaN(Number(val)) || t('common.invalid_input');
      break;
    default:
      promptConfig.type = 'input';
  }

  const { newValue } = await inquirer.prompt([promptConfig]);

  setConfigValue(keyToEdit, newValue);
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
    else if (!isNaN(Number(value)) && value.trim() !== '') typedValue = Number(value);
  }

  const updatedConfig = { ...currentConfig, [key]: typedValue };

  // Validate with Zod before saving
  const validation = ConfigSchema.partial().safeParse(updatedConfig);
  if (!validation.success) {
    logger.error(t('config.invalid_value', { key }));
    validation.error.errors.forEach(err => logger.error(` - ${err.message}`));
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
