# @ericgenovez/commitai

O **CommitAI** é uma ferramenta de linha de comando (CLI) profissional projetada para automatizar e padronizar seu fluxo de trabalho de desenvolvimento utilizando Inteligência Artificial. A ferramenta analisa suas alterações e gera mensagens de commit e descrições de Pull Request de alta qualidade, seguindo padrões da indústria como **Conventional Commits**.

[![NPM Version](https://img.shields.io/npm/v/@ericgenovez/commitai.svg)](https://www.npmjs.com/package/@ericgenovez/commitai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

### [🇺🇸 English](./README.md) | [🇪🇸 Español](./README.es.md)

---

## 🚀 Funcionalidades Principais

- **Interface Moderna**: Experiência de terminal premium construída com `@clack/prompts`, apresentando fluxos visuais contínuos e indicadores verticais.
- **Contexto do Projeto**: Configure a **Stack/Contexto do Projeto** (ex: "Frontend React com Tailwind") para que a IA gere descrições tecnicamente mais precisas e relevantes.
- **Templates Dinâmicos de PR**: Selecione interativamente quais seções incluir no seu Pull Request (O que mudou, Por que mudar, Como testar, Screenshots) a cada execução.
- **Commits Padronizados**: Gera mensagens baseadas no seu `git diff --staged` utilizando o padrão Conventional Commits.
- **Mentor de Commits**: Sugere a divisão de grandes alterações em commits menores e atômicos para um histórico de projeto mais limpo.
- **Suporte a Múltiplos Provedores**: Escolha entre OpenAI, Anthropic (Claude), Google Gemini, DeepSeek ou modelos locais via Ollama.
- **Localização Global**: Interface totalmente localizada em Português, Inglês e Espanhol.
- **Integração com Browser**: Abre automaticamente as páginas de criação de PR no GitHub/GitLab com título e corpo já preenchidos.
- **Edição Interativa**: Integração transparente com o editor padrão do seu terminal para ajustes manuais rápidos.

## 📦 Instalação

Instalação global via NPM:

```bash
npm install -g @ericgenovez/commitai
```

### Uso via npx (sem instalação)

```bash
npx @ericgenovez/commitai commit
```

## 🛠️ Início Rápido

### 1. Configuração Inicial

Configure seu provedor de IA, API Key e o contexto do seu projeto:

```bash
commitai init
```

### 2. Gerar Mensagem de Commit

Adicione seus arquivos ao stage (`git add .`) e execute:

```bash
commitai commit
```

A ferramenta apresentará uma sugestão. Você poderá aceitar, editar no seu editor de terminal ou gerar novamente.

### 3. Criar um Pull Request

Para gerar uma descrição completa de PR e abrir no navegador:

```bash
commitai pr
```

Siga os prompts para selecionar a branch de destino e as seções desejadas.

## ⚙️ Configuração

Gerencie todas as definições através de um menu interativo moderno:

```bash
commitai config
```

### Opções Disponíveis:

- **🤖 Configurar Provedor de IA**: Configure sequencialmente Provedor, Modelo e API Key.
- **📁 Contexto do Projeto**: Defina sua stack tecnológica para melhorar a precisão da IA.
- **🌐 Mudar Idioma do CLI**: Altere instantaneamente o idioma da interface.
- **Ajustar outras opções**: Refine o uso de emojis, estilos de commit e limites de linhas.

## 🤖 IA Local com Ollama

O CommitAI suporta execução local para maior privacidade e economia:

1. Instale o [Ollama](https://ollama.ai/).
2. Baixe o modelo desejado (ex: `ollama pull llama3`).
3. Rode `commitai init`, selecione **Ollama** e insira `llama3` como modelo.

## 🛠️ Desenvolvimento

```bash
# Instalação de dependências
npm install

# Build de produção
npm run build

# Linkar globalmente para testes
npm link
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
