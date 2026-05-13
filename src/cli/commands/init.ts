import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../../utils/logger';

export async function initAction() {
  logger.info('🚀 Bem-vindo ao configurador do CommitAI!\n');

  const { location } = await inquirer.prompt([
    {
      type: 'list',
      name: 'location',
      message: 'Onde deseja salvar a configuração?',
      choices: [
        { name: '🌎 Global (Home do usuário - recomendado)', value: 'global' },
        { name: '📁 Local (Pasta do projeto atual)', value: 'local' },
      ],
    },
  ]);

  const configDir = location === 'global' 
    ? path.join(os.homedir(), '.commitai') 
    : path.resolve(process.cwd(), '.commitai');

  const configPath = path.join(configDir, 'config.json');

  const { provider, apiKey, language, emojis, commitLength } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Escolha o provedor de IA:',
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
      message: 'Insira sua API Key (deixe em branco para usar variável de ambiente):',
      mask: '*',
    },
    {
      type: 'list',
      name: 'language',
      message: 'Idioma das mensagens:',
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
      message: 'Habilitar emojis nas mensagens?',
      default: true,
    },
    {
      type: 'list',
      name: 'commitLength',
      message: 'Estilo das mensagens de commit:',
      choices: [
        { name: '📝 Curto (Apenas o título)', value: 'short' },
        { name: '📄 Detalhado (Título + Lista de mudanças)', value: 'detailed' },
      ],
      default: 'detailed',
    },
  ]);

  const config = {
    provider,
    apiKey: apiKey || undefined,
    language,
    emojis,
    commitLength,
    model: provider === 'openai' ? 'gpt-5-mini' : undefined, // Defaults depend on provider
  };

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  logger.success(`\n✅ Configuração salva com sucesso em: ${configPath}`);
  logger.info('Agora você já pode usar "commitai commit" para gerar suas mensagens!');
}
