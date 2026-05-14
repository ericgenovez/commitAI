import { exec } from 'child_process';

/**
 * Abre uma URL no navegador padrão de forma cross-platform.
 */
export async function openInBrowser(url: string): Promise<void> {
  const platform = process.platform;
  let command = '';

  if (platform === 'win32') {
    // No Windows, o PowerShell é muito mais confiável para abrir URLs complexas
    command = `powershell -NoProfile -Command "Start-Process \\"${url}\\""`;
  } else if (platform === 'darwin') {
    command = `open "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        reject(new Error('Não foi possível abrir o navegador automaticamente.'));
      } else {
        resolve();
      }
    });
  });
}
