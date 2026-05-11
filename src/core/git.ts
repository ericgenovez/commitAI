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
   * Retorna o diff das alterações que estão no stage (staged changes).
   */
  async getStagedDiff(): Promise<string> {
    try {
      // 'diff' com '--staged' ou '--cached' pega o que está pronto para o commit
      return await this.git.diff(['--staged']);
    } catch (error) {
      throw new Error('Falha ao obter o diff do stage. Verifique se existem arquivos adicionados.');
    }
  }

  /**
   * Retorna o diff entre a branch atual e uma branch de destino (ex: main).
   */
  async getBranchDiff(targetBranch: string): Promise<string> {
    try {
      return await this.git.diff([`${targetBranch}...HEAD`]);
    } catch (error) {
      throw new Error(`Falha ao obter o diff com a branch ${targetBranch}.`);
    }
  }
}

export const gitManager = new GitManager();
