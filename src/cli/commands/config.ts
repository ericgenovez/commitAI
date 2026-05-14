import * as p from '@clack/prompts';
import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
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

  logger.banner();
  p.intro(chalk.bold(t('config.list_title', { path: configPath })));

  let shouldExit = false;

  while (!shouldExit) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    const keyToEdit = await p.select({
      message: t('config.select_to_edit'),
      options: [
        { label: t('config.setup_ai'), value: 'setup_ai' },
        { label: t('config.change_language'), value: 'change_language' },
        ...Object.entries(config)
          .filter(
            ([k]) =>
              !['provider', 'model', 'apiKey', 'cliLanguage'].includes(k),
          )
          .map(([key, val]) => {
            const friendlyName = t(`config.label_${key}`) || key;
            let displayValue = val;
            
            if (val === true) displayValue = t('config.value_true');
            else if (val === false) displayValue = t('config.value_false');
            else if (key === 'commitLength') displayValue = t(`config.value_${val}`);
            else if (typeof val === 'object') displayValue = JSON.stringify(val);

            return {
              label: `${friendlyName}: ${chalk.dim(displayValue)}`,
              value: key,
            };
          }),
        { label: chalk.red(t('config.exit')), value: 'exit' },
      ],
    });

    if (p.isCancel(keyToEdit) || keyToEdit === 'exit') {
      shouldExit = true;
      continue;
    }

    if (keyToEdit === 'setup_ai') {
      await setupAIProvider(config);
      continue;
    }

    if (keyToEdit === 'change_language') {
      await changeCLILanguage(config);
      continue;
    }

    // Handle individual settings
    let newValue: any;

    switch (keyToEdit) {
      case 'language':
        newValue = await p.select({
          message: t('config.enter_new_value', { key: t(`config.label_${keyToEdit}`) || keyToEdit }),
          initialValue: config[keyToEdit],
          options: [
            { label: 'Português (Brasil)', value: 'pt-BR' },
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' },
          ],
        });
        break;
      case 'convention':
        newValue = await p.select({
          message: t('config.enter_new_value', { key: t(`config.label_${keyToEdit}`) || keyToEdit }),
          initialValue: config[keyToEdit],
          options: [
            { label: 'Conventional Commits', value: 'conventional' },
            { label: 'Angular', value: 'angular' },
            { label: 'Karma', value: 'karma' },
          ],
        });
        break;
      case 'commitLength':
        newValue = await p.select({
          message: t('config.enter_new_value', { key: t(`config.label_${keyToEdit}`) || keyToEdit }),
          initialValue: config[keyToEdit],
          options: [
            { label: t('config.value_short'), value: 'short' },
            { label: t('config.value_detailed'), value: 'detailed' },
          ],
        });
        break;
      case 'emojis':
        newValue = await p.confirm({
          message: t('config.enter_new_value', { key: t(`config.label_${keyToEdit}`) || keyToEdit }),
          initialValue: config[keyToEdit],
          active: t('common.yes'),
          inactive: t('common.no'),
        });
        break;
      case 'maxDiffLines':
        newValue = await p.text({
          message: t('config.enter_new_value', { key: t(`config.label_${keyToEdit}`) || keyToEdit }),
          initialValue: String(config[keyToEdit]),
          validate: (val: string) => !isNaN(Number(val)) ? undefined : t('common.invalid_input'),
        });
        if (!p.isCancel(newValue)) newValue = Number(newValue);
        break;
      default:
        newValue = await p.text({
          message: t('config.enter_new_value', { key: t(`config.label_${keyToEdit}`) || keyToEdit }),
          initialValue: String(config[keyToEdit]),
        });
    }

    if (p.isCancel(newValue)) continue;

    setConfigValue(keyToEdit as string, newValue);
  }

  p.outro(t('common.cancel_info'));
}

async function setupAIProvider(currentConfig: any) {
  const provider = await p.select({
    message: t('init.provider_question'),
    initialValue: currentConfig.provider,
    options: [
      { label: 'OpenAI', value: 'openai' },
      { label: 'Anthropic (Claude)', value: 'anthropic' },
      { label: 'Google (Gemini)', value: 'gemini' },
      { label: 'DeepSeek', value: 'deepseek' },
      { label: 'Ollama (Local)', value: 'ollama' },
    ],
  });

  if (p.isCancel(provider)) return;

  let defaultModel = currentConfig.model;
  if (provider === 'openai') defaultModel = 'gpt-5-mini';
  if (provider === 'gemini') defaultModel = 'gemini-2.0-flash';
  if (provider === 'anthropic') defaultModel = 'claude-3-5-sonnet-latest';

  const model = await p.text({
    message: t('config.model_question'),
    initialValue: defaultModel,
  });

  if (p.isCancel(model)) return;

  const apiKey = await p.password({
    message: t('init.apikey_question'),
  });

  if (p.isCancel(apiKey)) return;

  const updates: any = { provider, model };
  if (apiKey) updates.apiKey = apiKey;

  setMultipleConfigValues(updates);
}

async function changeCLILanguage(currentConfig: any) {
  const cliLanguage = await p.select({
    message: t('init.cli_language_question'),
    initialValue: currentConfig.cliLanguage,
    options: [
      { label: 'Português (Brasil)', value: 'pt-BR' },
      { label: 'English', value: 'en' },
      { label: 'Español', value: 'es' },
    ],
  });

  if (p.isCancel(cliLanguage)) return;

  setConfigValue('cliLanguage', cliLanguage as string);
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
