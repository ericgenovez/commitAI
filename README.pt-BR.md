# @ericgenovez/commitai

O **CommitAI** é uma ferramenta de linha de comando (CLI) profissional projetada para automatizar e padronizar fluxos de trabalho do Git utilizando Inteligência Artificial. A ferramenta analisa suas alterações e gera mensagens de commit e descrições de Pull Request de alta qualidade, seguindo padrões da indústria como **Conventional Commits**.

[![NPM Version](https://img.shields.io/npm/v/@ericgenovez/commitai.svg)](https://www.npmjs.com/package/@ericgenovez/commitai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

### [🇺🇸 English](./README.md) | [🇪🇸 Español](./README.es.md)

---

## 🚀 Funcionalidades Principais

- **Commits Padronizados**: Gera mensagens baseadas no seu `git diff --staged` utilizando o padrão Conventional Commits.
- **Mentor de Commits**: Caso o volume de alterações seja muito grande, a ferramenta sugere a separação de arquivos para manter commits atômicos e organizados.
- **Descrições de PR Inteligentes**: Compara branches e gera descrições detalhadas automaticamente.
- **Integração com Browser**: Abre a página de criação de Pull Request no GitHub ou GitLab com título e descrição já preenchidos.
- **Edição Interativa**: Integra-se ao seu editor padrão (VS Code, Vim, etc.) para revisões manuais.
- **Localização Global**: Toda a interface do CLI está disponível em Inglês, Português e Espanhol.
- **Otimização de Custos**: Ignora automaticamente lockfiles e binários para economizar tokens.

## 📦 Instalação

A instalação global é feita via NPM:

```bash
npm install -g @ericgenovez/commitai
```

### Uso via npx (sem instalação)
```bash
npx @ericgenovez/commitai commit
```

## 🛠️ Guia de Uso

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

## ⚙️ Configurações Avançadas

Você pode gerenciar as configurações de forma granular sem precisar rodar o assistente completo.

### Usando o comando `config`
- **Listar todas as configs**: `commitai config list`
- **Definir um valor específico**: `commitai config set commitLength short`
- **Ler um valor**: `commitai config get provider`

### Chaves Suportadas
- `provider`: `openai`, `anthropic`, `deepseek`, `ollama`
- `model`: Modelo de IA (ex: `gpt-5-mini`, `claude-3-5-sonnet`)
- `language`: Idioma de saída (`en`, `pt-BR`, `es`)
- `commitLength`: `short` ou `detailed`
- `emojis`: `true` ou `false`
- `maxDiffLines`: Limite de linhas processadas (Padrão: `600`)

## 🤖 IA Local com Ollama

O CommitAI suporta execução local via Ollama.
1. Instale o [Ollama](https://ollama.ai/).
2. Baixe um modelo (ex: `ollama pull llama3`).
3. Rode `commitai init`, selecione `Ollama` e insira `llama3` como modelo.

## 🛠️ Desenvolvimento

```bash
# Instalação de dependências
npm install

# Execução em modo desenvolvimento
npm run dev -- commit

# Build de produção
npm run build

# Linkar globalmente para testes
npm link
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
