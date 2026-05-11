import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('commitai')
  .description('CLI tool to generate commit messages and PR descriptions using AI')
  .version('0.1.0');

program
  .command('commit')
  .description('Generate a commit message from staged changes')
  .action(() => {
    console.log(chalk.blue('Commit command coming soon!'));
  });

program
  .command('pr')
  .description('Generate a PR description from branch differences')
  .action(() => {
    console.log(chalk.blue('PR command coming soon!'));
  });

program.parse(process.argv);
