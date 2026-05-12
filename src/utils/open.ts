import { exec } from 'child_process';

/**
 * Abre uma URL no navegador padrão de forma cross-platform.
 */
export async function openInBrowser(url: string): Promise<void> {
  const platform = process.platform;
  let command = '';

  if (platform === 'win32') {
    // No Windows, o primeiro parâmetro vazio "" é o título da janela, o segundo é a URL
    command = `start "" "${url.replace(/&/g, '^&')}"`;
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
