#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { commitAction } from './commands/commit';
import { prAction } from './commands/pr';
import { initAction } from './commands/init';

const program = new Command();

program
  .name('commitai')
  .description('CLI tool to generate commit messages and PR descriptions using AI')
  .version('0.1.0');

program
  .command('init')
  .description('Inicializa ou atualiza a configuração do CommitAI')
  .action(initAction);

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

// final test
