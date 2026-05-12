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
  .description('Initialize or update CommitAI configuration')
  .action(initAction);

program
  .command('commit')
  .description('Generate a commit message from staged changes')
  .action(commitAction);

program
  .command('pr')
  .description('Generate a PR description from branch differences')
  .action(prAction);

program.parse(process.argv);
