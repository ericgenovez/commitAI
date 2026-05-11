import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ConfigSchema, CommitAIConfig } from './schema';

dotenv.config();

/*
  Lê o arquivo de configuração local do projeto e faz o merge com variáveis de ambiente.
  Retorna a configuração validada via Zod.
*/

export function loadConfig(): CommitAIConfig {
  const configPath = path.resolve(process.cwd(), '.commitai', 'config.json');
  let rawConfig: Partial<CommitAIConfig> = {};

  if (fs.existsSync(configPath)) {
    try {
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      rawConfig = JSON.parse(fileContent);
    } catch (error) {
      console.warn(
        `[CommitAI] Warning: Could not parse ${configPath}. Using defaults.`,
      );
    }
  }

  const apiKey = process.env.COMMITAI_API_KEY || rawConfig.apiKey;

  if (!apiKey && !process.env.VITEST) {
    console.error('\n[CommitAI] ❌ Erro: API Key não encontrada.');
    console.error('Para usar o CommitAI, você precisa definir a variável COMMITAI_API_KEY no seu arquivo .env ou no ambiente do sistema.\n');
    process.exit(1);
  }

  const mergedConfig = {
    ...rawConfig,
    apiKey,
  };

  // Valida e aplica defaults usando Zod
  const result = ConfigSchema.safeParse(mergedConfig);

  if (!result.success) {
    console.error('[CommitAI] Error: Invalid configuration.');
    result.error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }

  return result.data;
}
