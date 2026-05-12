# CommitAI 🚀

O CommitAI é uma ferramenta de linha de comando (CLI) profissional projetada para automatizar fluxos de trabalho do Git usando Inteligência Artificial. Ele analisa suas alterações e gera mensagens de commit de alta qualidade e descrições de Pull Request diretamente do terminal, seguindo as melhores práticas da indústria.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2020.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## ✨ Funcionalidades

- **🧠 Commits Inteligentes:** Gera mensagens baseadas no seu `git diff --staged` seguindo o padrão **Conventional Commits** com emojis.
- **📝 Descrições de PR:** Cria descrições abrangentes comparando branches automaticamente.
- **🌐 Suporte Multi-Provedor:** Integração com OpenAI, Anthropic (Claude), DeepSeek e modelos locais via Ollama.
- **⚙️ Configuração Flexível:** Suporta configurações globais (`~/.commitai/config.json`) e locais por projeto.
- **⌨️ Fluxo Interativo:** Revise, escreva manualmente ou peça para a IA regenerar antes de confirmar.

## 📦 Instalação

### Opção 1: Instalação Global (Recomendado)
Para usar o comando `commitai` em qualquer lugar:
```bash
npm install -g github:ericgenovez/commitAI
```

### Opção 2: Sem Instalação (Via npx)
Ideal para uso rápido ou em CI:
```bash
npx github:ericgenovez/commitAI commit
```

### Opção 3: Como dependência de desenvolvimento
Se preferir manter no projeto:
```bash
npm install --save-dev github:ericgenovez/commitAI
```
*Neste caso, utilize `npx commitai commit` ou adicione um script no seu `package.json`.*

## 🚀 Como Usar

### 1. Configuração da API Key
A ferramenta busca sua chave na seguinte ordem de prioridade:
1. Variável de ambiente `COMMITAI_API_KEY` (no seu `.env` ou shell)
2. Arquivo de configuração local: `.commitai/config.json`
3. Arquivo de configuração global: `~/.commitai/config.json`

### 2. Gerar Mensagem de Commit
Adicione seus arquivos ao stage e rode:
```bash
commitai commit
```

### 3. Gerar Descrição de PR
```bash
commitai pr
```

## ⚙️ Customização

Você pode criar um arquivo `.commitai/config.json` para personalizar o comportamento:

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "language": "pt-BR",
  "emojis": true,
  "maxDiffLines": 300
}
```

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo dev
npm run dev -- commit

# Build
npm run build
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](LICENSE) para detalhes.
