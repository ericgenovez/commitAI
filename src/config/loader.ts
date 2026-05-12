import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
import { ConfigSchema, CommitAIConfig } from './schema';

dotenv.config();

/**
 * Loads the configuration by merging:
 * 1. Default values (via Zod)
 * 2. Global config (~/.commitai/config.json)
 * 3. Local project config (.commitai/config.json)
 * 4. Environment variables (COMMITAI_API_KEY)
 */
export function loadConfig(): CommitAIConfig {
  const globalConfigPath = path.join(os.homedir(), '.commitai', 'config.json');
  const localConfigPath = path.resolve(process.cwd(), '.commitai', 'config.json');

  let config: Partial<CommitAIConfig> = {};

  // 1. Try to load Global Config
  if (fs.existsSync(globalConfigPath)) {
    try {
      const globalContent = fs.readFileSync(globalConfigPath, 'utf-8');
      config = { ...config, ...JSON.parse(globalContent) };
    } catch (error) {
      console.warn(`[CommitAI] Warning: Could not parse global config at ${globalConfigPath}`);
    }
  }

  // 2. Try to load Local Config (overrides global)
  if (fs.existsSync(localConfigPath)) {
    try {
      const localContent = fs.readFileSync(localConfigPath, 'utf-8');
      config = { ...config, ...JSON.parse(localContent) };
    } catch (error) {
      console.warn(`[CommitAI] Warning: Could not parse local config at ${localConfigPath}`);
    }
  }

  const apiKey = process.env.COMMITAI_API_KEY || config.apiKey;

  if (!apiKey && !process.env.VITEST) {
    console.error('\n[CommitAI] ❌ Erro: API Key não encontrada.');
    console.error('Para usar o CommitAI, você precisa definir a variável COMMITAI_API_KEY no seu arquivo .env, no ambiente do sistema, ou em ~/.commitai/config.json\n');
    process.exit(1);
  }

  const mergedConfig = {
    ...config,
    apiKey,
  };

  // Validate and apply defaults using Zod
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
