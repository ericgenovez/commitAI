# @ericgenovez/commitai

O **CommitAI** é uma ferramenta de linha de comando (CLI) projetada para automatizar e padronizar fluxos de trabalho do Git utilizando Inteligência Artificial. A ferramenta analisa suas alterações e gera mensagens de commit e descrições de Pull Request seguindo padrões da indústria como **Conventional Commits**.

[![NPM Version](https://img.shields.io/npm/v/@ericgenovez/commitai.svg)](https://www.npmjs.com/package/@ericgenovez/commitai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Funcionalidades Principais

- **Commits Padronizados**: Gera mensagens baseadas no seu `git diff --staged` utilizando o padrão Conventional Commits.
- **Mentor de Commits**: Caso o volume de alterações seja muito grande, a ferramenta sugere a separação de arquivos para manter commits atômicos e organizados.
- **Descrições de PR Inteligentes**: Cria descrições detalhadas comparando branches e extraindo títulos técnicos automaticamente.
- **Integração com Browser**: Abre a página de criação de Pull Request no GitHub ou GitLab com título e descrição já preenchidos.
- **Edição Profissional**: Integra-se ao seu editor de texto padrão (VS Code, Notepad, Vim) para revisões manuais complexas.
- **Filtro Automático**: Ignora arquivos irrelevantes como lockfiles e binários para otimizar o processamento e custos.

## Instalação

A instalação global é feita via NPM:

```bash
npm install -g @ericgenovez/commitai
```

### Uso via npx (sem instalação)
```bash
npx @ericgenovez/commitai commit
```

## Guia de Uso

### 1. Configuração Inicial
Rode o comando abaixo para configurar seu provedor de IA (OpenAI, Anthropic, DeepSeek ou Ollama) e sua API Key:
```bash
commitai init
```

### 2. Gerar Mensagem de Commit
Após adicionar seus arquivos ao stage (`git add .`), execute:
```bash
commitai commit
```
A ferramenta apresentará uma sugestão. Você poderá aceitar, editar no seu editor padrão ou regenerar a mensagem.

### 3. Gerar Pull Request
Para criar uma descrição de PR e abrir no navegador:
```bash
commitai pr
```
O sistema perguntará a branch de destino, gerará o conteúdo e oferecerá a opção de realizar o `push` automático antes de abrir o navegador.

## Configurações Avançadas

As configurações ficam armazenadas em seu diretório pessoal em `~/.commitai/config.json`.

### Controle de Limites
- **`maxDiffLines`**: Define o limite de linhas processadas pela IA (Padrão: `600`).
- **Filtros**: Arquivos como `package-lock.json`, imagens e binários são excluídos automaticamente.

### Sobrescrita de Modelo
Você pode utilizar um modelo diferente para uma execução específica usando a flag `--model`:
```bash
commitai commit --model gpt-4o
```

## Desenvolvimento

```bash
# Instalação de dependências
npm install

# Execução em modo desenvolvimento
npm run dev -- commit

# Build de produção
npm run build
```

## Licença

Este projeto está licenciado sob a Licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
