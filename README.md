# @ericgenovez/commitai 🚀

O **CommitAI** é uma ferramenta de linha de comando (CLI) profissional projetada para automatizar fluxos de trabalho do Git usando Inteligência Artificial. Ele analisa suas alterações e gera mensagens de commit de alta qualidade e descrições de Pull Request diretamente do terminal, seguindo as melhores práticas da indústria como **Conventional Commits**.

[![NPM Version](https://img.shields.io/npm/v/@ericgenovez/commitai.svg)](https://www.npmjs.com/package/@ericgenovez/commitai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)](https://nodejs.org/)

## ✨ Funcionalidades

- **🧠 Commits Inteligentes:** Gera mensagens baseadas no seu `git diff --staged` seguindo o padrão Conventional Commits.
- **📝 Descrições de PR:** Cria descrições abrangentes comparando branches automaticamente.
- **🌐 Integração com Navegador:** Abre automaticamente a página de criação de PR no GitHub ou GitLab.
- **🔍 Filtro Inteligente:** Ignora automaticamente arquivos pesados e irrelevantes (como lockfiles e binários) para economizar tokens.
- **⚙️ Configuração Flexível:** Suporta OpenAI, Anthropic, DeepSeek e Ollama.
- **⌨️ Fluxo Interativo:** Revise, edite ou peça para a IA regenerar antes de confirmar.

## 📦 Instalação

A forma recomendada de instalar o CommitAI globalmente é via NPM:

```bash
npm install -g @ericgenovez/commitai
```

### Uso rápido (sem instalação)
```bash
npx @ericgenovez/commitai commit
```

## 🚀 Como Usar

### 1. Configuração Inicial
Na primeira vez, rode o comando abaixo para configurar sua API Key e provedor de preferência:
```bash
commitai init
```

### 2. Gerar Mensagem de Commit
Adicione seus arquivos ao stage (`git add`) e rode:
```bash
commitai commit
```
*Dica: Você pode sobrescrever o modelo configurado usando a flag `--model`:*
`commitai commit --model gpt-4o`

### 3. Gerar Descrição de PR
```bash
commitai pr
```
Este comando irá gerar a descrição, copiá-la para o seu clipboard e oferecer a opção de abrir o navegador diretamente na página de criação do PR.

## ⚙️ Customização

Você pode personalizar o comportamento do CommitAI editando o arquivo `~/.commitai/config.json`.

### Controle de Custos e Performance
Por padrão, o CommitAI limita o tamanho do diff enviado para a IA para evitar custos inesperados.

- **`maxDiffLines`**: Define o máximo de linhas de código que a IA irá ler (Padrão: `600`).
- **Filtros Automáticos**: Arquivos como `package-lock.json`, imagens e binários são ignorados automaticamente para economizar tokens.

Para aumentar o limite (ex: para 1000 linhas), altere seu arquivo de configuração:
```json
{
  "maxDiffLines": 1000
}
```

> 💡 **Dica Profissional:** Para melhores resultados e economia, tente fazer commits menores e mais frequentes. Isso ajuda a IA a ser muito mais precisa na descrição das alterações.

O CommitAI busca configurações na seguinte ordem:
1. Variáveis de ambiente (`COMMITAI_API_KEY`)
2. Flag `--model` via linha de comando
3. Configuração local: `.commitai/config.json`
4. Configuração global: `~/.commitai/config.json`

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo dev
npm run dev -- commit

# Build otimizado
npm run build
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](LICENSE) para detalhes.
