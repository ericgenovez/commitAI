import inquirer from 'inquirer';
import { gitManager } from '../../core/git';
import { loadConfig } from '../../config/loader';
import { ProviderFactory } from '../../providers/factory';
import { truncateDiff } from '../../utils/truncate';
import { logger } from '../../utils/logger';
import { clipboard } from '../../utils/clipboard';
import { initAction } from './init';
import { formatUsage, getModelTier } from '../../utils/costs';
import chalk from 'chalk';
import { openInBrowser } from '../../utils/open';
import boxen from 'boxen';

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function hasGitHubCLI() {
  try {
    await execAsync('gh --version');
    return true;
  } catch {
    return false;
  }
}

export async function prAction(options: { model?: string } = {}) {
  try {
    let config = loadConfig();

    if (options.model) {
      config.model = options.model;
    }

    if (!config.apiKey && !process.env.VITEST) {
      logger.warn('API Key não encontrada.');
      const { runInit } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'runInit',
          message: 'Deseja configurar o CommitAI agora?',
          default: true,
        },
      ]);

      if (runInit) {
        await initAction();
        config = loadConfig();
      } else {
        logger.error('Para usar o CommitAI, você precisa definir uma API Key.');
        return;
      }
    }

    if (!(await gitManager.isRepo())) {
      logger.error('Diretório atual não é um repositório Git.');
      return;
    }

    let targetBranch = 'main';
    let step: 'ask_branch' | 'generate' | 'review' | 'edit' | 'done' = 'ask_branch';
    let currentPRDescription = '';
    let currentUsage: any = null;

    while (step !== 'done') {
      if (step === 'ask_branch') {
        const { branch } = await inquirer.prompt([
          {
            type: 'input',
            name: 'branch',
            message: 'Qual a branch de destino (target branch)?',
            default: targetBranch,
          },
        ]);
        targetBranch = branch;
        step = 'generate';
      }

      if (step === 'generate') {
        const spinner = logger.spinner(`Obtendo diff com a branch ${chalk.cyan(targetBranch)}...`);
        let diff: string;
        try {
          diff = await gitManager.getBranchDiff(targetBranch);
          if (!diff) {
            spinner.stop();
            logger.warn('Nenhuma diferença encontrada entre as branches.');
            step = 'ask_branch';
            continue;
          }
          
          spinner.text = `Gerando descrição com ${chalk.cyan(config.provider)}...`;
          const truncatedDiff = truncateDiff(diff, config.maxDiffLines);
          const provider = ProviderFactory.getProvider(config);
          const response = await provider.generatePRDescription(truncatedDiff, config.prTemplate.sections);
          
          currentPRDescription = response.content;
          currentUsage = response.usage;
          spinner.succeed('Descrição gerada!\n');
          step = 'review';
        } catch (error: any) {
          spinner.fail('Erro no processo.');
          logger.error(error.message);
          return;
        }
      }

      if (step === 'review') {
        console.log('\n' + boxen(chalk.white(currentPRDescription), {
          padding: 1,
          margin: { top: 1, bottom: 0 },
          borderStyle: 'round',
          borderColor: 'magenta',
          title: chalk.bold.magenta(' 📝 Descrição do PR '),
          titleAlignment: 'center',
        }));

        if (currentUsage) {
          const usageText = formatUsage({
            promptTokens: currentUsage.promptTokens,
            completionTokens: currentUsage.completionTokens,
          });
          console.log(chalk.dim(`  📊 ${usageText} | 🏷️  ${getModelTier(config.model)}\n`));
        }

        const canUseGH = await hasGitHubCLI();
        const choices = [
          { name: '📋 Copiar para o clipboard', value: 'copy' },
          { name: '🌐 Abrir no navegador', value: 'browser' },
          ...(canUseGH ? [{ name: '🐙 Criar PR via GitHub CLI (gh)', value: 'gh' }] : []),
          { name: '✍️  Editar manualmente', value: 'edit' },
          { name: '🔄 Voltar para escolha de branch', value: 'ask_branch' },
          { name: '❌ Cancelar', value: 'cancel' },
        ];

        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'O que deseja fazer?',
            choices,
          },
        ]);

        switch (action) {
          case 'copy':
            await clipboard.copy(currentPRDescription);
            logger.success('Copiado para o clipboard!');
            break;
          case 'browser':
            const remoteUrl = await gitManager.getRemoteUrl();
            if (remoteUrl) {
              const currentBranch = await gitManager.getCurrentBranch();
              const cleanUrl = remoteUrl.replace('git@', 'https://').replace(':', '/').replace(/\.git$/, '');
              let prUrl = '';
              if (cleanUrl.includes('github.com')) {
                prUrl = `${cleanUrl}/compare/${targetBranch}...${currentBranch}?expand=1`;
              } else if (cleanUrl.includes('gitlab.com')) {
                prUrl = `${cleanUrl}/-/merge_requests/new?merge_request[source_branch]=${currentBranch}&merge_request[target_branch]=${targetBranch}`;
              }
              if (prUrl) {
                await clipboard.copy(currentPRDescription);
                logger.info('Descrição copiada para facilitar o preenchimento.');
                await openInBrowser(prUrl);
                logger.success('Navegador aberto!');
                step = 'done';
              }
            }
            break;
          case 'gh':
            const spinner = logger.spinner('Criando PR via GitHub CLI...');
            try {
              // Salva descrição em arquivo temporário para evitar problemas de escape
              const fs = require('fs');
              const tmpFile = 'pr_desc.tmp';
              fs.writeFileSync(tmpFile, currentPRDescription);
              await execAsync(`gh pr create --base ${targetBranch} --title "PR gerada por CommitAI" --body-file ${tmpFile}`);
              fs.unlinkSync(tmpFile);
              spinner.succeed('PR criada com sucesso!');
              step = 'done';
            } catch (error: any) {
              spinner.fail('Erro ao usar GitHub CLI.');
              logger.error(error.message);
            }
            break;
          case 'edit':
            step = 'edit';
            break;
          case 'ask_branch':
            step = 'ask_branch';
            break;
          case 'cancel':
            step = 'done';
            break;
        }
      }

      if (step === 'edit') {
        const { editedPR } = await inquirer.prompt([
          {
            type: 'input',
            name: 'editedPR',
            message: 'Edite a descrição (ou deixe vazio para voltar):',
            default: currentPRDescription,
          },
        ]);
        if (editedPR.trim()) currentPRDescription = editedPR;
        step = 'review';
      }
    }
  } catch (error: any) {
    logger.error(error.message);
  }
}
