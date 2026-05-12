import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const clipboard = {
  async copy(text: string): Promise<void> {
    const platform = process.platform;

    // Sanitização para Windows para evitar erros de encoding no comando 'clip'
    const sanitizeForWindows = (str: string) => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // Remove emojis
        .replace(/[^\x00-\x7F]/g, ''); // Remove qualquer outro caractere não-ASCII
    };

    return new Promise((resolve) => {
      let textToCopy = text;

      if (platform === 'win32') {
        textToCopy = sanitizeForWindows(text);

        const proc = exec('clip');
        proc.on('close', () => resolve());
        proc.on('error', () => {
          console.warn('\n⚠️  Não foi possível copiar automaticamente.');
          resolve();
        });
        proc.stdin?.write(textToCopy);
        proc.stdin?.end();
        return;
      }

      let command = '';
      if (platform === 'darwin') {
        command = 'pbcopy';
      } else {
        command = 'xclip -selection clipboard';
      }

      const child = exec(command, (error) => {
        if (error) {
          if (platform === 'linux') {
            const fallbackChild = exec(
              'xsel --clipboard --input',
              (fallbackError) => {
                if (fallbackError) resolve();
                else resolve();
              },
            );
            fallbackChild.stdin?.write(text);
            fallbackChild.stdin?.end();
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });

      child.stdin?.write(textToCopy);
      child.stdin?.end();
    });
  },
};
