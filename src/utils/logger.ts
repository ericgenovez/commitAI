import chalk from 'chalk';
import ora, { Ora } from 'ora';
import gradient from 'gradient-string';
import figlet from 'figlet';

export const logger = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✔'), msg),
  error: (msg: string) => console.log(chalk.red('✖'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  
  banner: () => {
    const text = figlet.textSync('CommitAI', {
      font: 'Slant',
      horizontalLayout: 'fitted',
    });
    console.log('\n' + gradient.atlas.multiline(text) + '\n');
  },

  spinner: (text: string): Ora => {
    return ora({
      text,
      color: 'cyan',
    }).start();
  },
};
