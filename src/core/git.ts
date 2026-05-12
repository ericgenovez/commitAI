import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git';

export class GitManager {
  private git: SimpleGit;

  constructor() {
    const options: Partial<SimpleGitOptions> = {
      baseDir: process.cwd(),
      binary: 'git',
      maxConcurrentProcesses: 6,
    };
    this.git = simpleGit(options);
  }

  /**
   * Verifica se o diretório atual é um repositório Git válido.
   */
  async isRepo(): Promise<boolean> {
    try {
      return await this.git.checkIsRepo();
    } catch {
      return false;
    }
  }

  /**
   * Retorna o diff das alterações que estão no stage (staged changes),
   * ignorando arquivos irrelevantes ou muito grandes.
   */
  async getStagedDiff(): Promise<string> {
    try {
      const ignoredFiles = [
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        '*.lock',
        '*.png',
        '*.jpg',
        '*.jpeg',
        '*.gif',
        '*.svg',
        '*.pdf',
      ];
      
      const excludeArgs = ignoredFiles.map(pattern => `:(exclude)${pattern}`);
      return await this.git.diff(['--staged', '--', '.', ...excludeArgs]);
    } catch (error) {
      throw new Error('Falha ao obter o diff do stage. Verifique se existem arquivos adicionados.');
    }
  }

  /**
   * Retorna o diff entre a branch atual e uma branch de destino (ex: main),
   * ignorando arquivos irrelevantes.
   */
  async getBranchDiff(targetBranch: string): Promise<string> {
    try {
      const ignoredFiles = [
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        '*.lock',
      ];
      
      const excludeArgs = ignoredFiles.map(pattern => `:(exclude)${pattern}`);
      return await this.git.diff([`${targetBranch}...HEAD`, '--', '.', ...excludeArgs]);
    } catch (error) {
      throw new Error(`Falha ao obter o diff com a branch ${targetBranch}.`);
    }
  }

  /**
   * Realiza o commit das alterações no stage com a mensagem fornecida.
   */
  async commit(message: string): Promise<void> {
    try {
      await this.git.commit(message);
    } catch (error) {
      throw new Error('Falha ao realizar o commit.');
    }
  }

  /**
   * Retorna o nome da branch atual.
   */
  async getCurrentBranch(): Promise<string> {
    try {
      const branchData = await this.git.branch();
      return branchData.current;
    } catch (error) {
      throw new Error('Falha ao obter a branch atual.');
    }
  }

  /**
   * Retorna a URL do remote origin.
   */
  async getRemoteUrl(): Promise<string | null> {
    try {
      const remotes = await this.git.getRemotes(true);
      const origin = remotes.find((r) => r.name === 'origin');
      return origin ? origin.refs.push : null;
    } catch {
      return null;
    }
  }
}

export const gitManager = new GitManager();
