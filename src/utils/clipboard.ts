import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const clipboard = {
  /**
   * Copia um texto para o clipboard do sistema usando comandos nativos.
   */
  async copy(text: string): Promise<void> {
    const platform = process.platform;
    
    return new Promise((resolve, reject) => {
      let command = '';
      if (platform === 'win32') {
        // Usa PowerShell via stdin para evitar erros de escape de caracteres especiais e encoding
        const child = exec('powershell -NoProfile -EncodedCommand U2V0LUNsaXBib2FyZCAtVmFsdWUgJGlucHV0', (error) => {
          if (error) reject(new Error('Falha ao copiar para o clipboard.'));
          else resolve();
        });
        
        child.stdin?.write(text, 'utf8');
        child.stdin?.end();
        return;
      } else if (platform === 'darwin') {
        command = 'pbcopy';
      } else {
        // Linux: tenta xclip, se falhar não faz nada (ou lança erro)
        command = 'xclip -selection clipboard';
      }

      const child = exec(command, (error) => {
        if (error) {
          // Fallback para Linux com xsel
          if (platform === 'linux') {
            const fallbackChild = exec('xsel --clipboard --input', (fallbackError) => {
              if (fallbackError) reject(new Error('Falha ao copiar para o clipboard.'));
              else resolve();
            });
            fallbackChild.stdin?.write(text);
            fallbackChild.stdin?.end();
          } else {
            reject(new Error('Falha ao copiar para o clipboard.'));
          }
        } else {
          resolve();
        }
      });

      child.stdin?.write(text);
      child.stdin?.end();
    });
  }
};
