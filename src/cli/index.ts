#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { commitAction } from './commands/commit';
import { prAction } from './commands/pr';
import { initAction } from './commands/init';
import { configAction } from './commands/config';
import { initI18n } from '../utils/i18n';

const program = new Command();

async function main() {
  await initI18n();

  program
    .name('commitai')
    .description('CLI tool to generate commit messages and PR descriptions using AI')
    .version('1.0.4');

  program
    .command('init')
    .description('Inicializa ou atualiza a configuração do CommitAI')
    .action(initAction);

  program
    .command('config <subcommand> [key] [value]')
    .description('Gerencia configurações de forma granular (set, get, list)')
    .action(configAction);

  program
    .command('commit')
    .description('Gera uma mensagem de commit baseada nas alterações no stage')
    .option('-m, --model <model>', 'Sobrescreve o modelo de IA definido na configuração')
    .action(commitAction);

  program
    .command('pr')
    .description('Gera uma descrição de Pull Request comparando branches')
    .option('-m, --model <model>', 'Sobrescreve o modelo de IA definido na configuração')
    .action(prAction);

  program.parse(process.argv);
}

main();

// final test
