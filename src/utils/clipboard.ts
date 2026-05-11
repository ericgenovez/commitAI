import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const clipboard = {
  /**
   * Copia um texto para o clipboard do sistema usando comandos nativos.
   */
  async copy(text: string): Promise<void> {
    const platform = process.platform;
    
    try {
      if (platform === 'win32') {
        // No Windows, usamos o comando 'clip'
        // Usamos echo com pipe para o clip, escapando caracteres especiais se necessário
        const command = `echo ${text.replace(/[&|<>=^]/g, '^$&')} | clip`;
        await execAsync(command);
      } else if (platform === 'darwin') {
        // No macOS, usamos 'pbcopy'
        const proc = exec('pbcopy');
        proc.stdin?.write(text);
        proc.stdin?.end();
      } else {
        // No Linux, tentamos xclip ou xsel
        try {
          const proc = exec('xclip -selection clipboard');
          proc.stdin?.write(text);
          proc.stdin?.end();
        } catch {
          const proc = exec('xsel --clipboard --input');
          proc.stdin?.write(text);
          proc.stdin?.end();
        }
      }
    } catch (error) {
      throw new Error('Não foi possível copiar para o clipboard automaticamente.');
    }
  }
};
