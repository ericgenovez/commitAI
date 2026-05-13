# @ericgenovez/commitai

**CommitAI** is a professional Command Line Interface (CLI) designed to automate and standardize Git workflows using Artificial Intelligence. It analyzes your changes and generates high-quality commit messages and Pull Request descriptions following industry standards like **Conventional Commits**.

[![NPM Version](https://img.shields.io/npm/v/@ericgenovez/commitai.svg)](https://www.npmjs.com/package/@ericgenovez/commitai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

### [🇧🇷 Português](./README.pt-BR.md) | [🇪🇸 Español](./README.es.md)

---

## 🚀 Key Features

- **Standardized Commits**: Generates messages based on your `git diff --staged` using the Conventional Commits pattern.
- **Commit Mentor**: Suggests splitting large commits to maintain atomic and organized history.
- **Smart PR Descriptions**: Compares branches and generates detailed descriptions automatically.
- **Browser Integration**: Opens GitHub/GitLab PR creation pages with title and description pre-filled.
- **Interactive Editing**: Integrates with your default editor (VS Code, Vim, etc.) for manual reviews.
- **Global Localization**: The entire CLI interface is available in English, Portuguese, and Spanish.
- **Cost Optimization**: Automatically ignores lockfiles and binaries to save tokens and costs.

## 📦 Installation

Global installation via NPM:

```bash
npm install -g @ericgenovez/commitai
```

### Usage via npx (without installation)
```bash
npx @ericgenovez/commitai commit
```

## 🛠️ Usage Guide

### 1. Initial Setup
Run the command below to configure your AI provider (OpenAI, Anthropic, DeepSeek, or Ollama) and your API Key:
```bash
commitai init
```

### 2. Generate Commit Message
After adding your files to the stage (`git add .`), run:
```bash
commitai commit
```
The tool will present a suggestion. You can accept, edit in your default editor, or regenerate it.

### 3. Generate Pull Request
To create a PR description and open it in the browser:
```bash
commitai pr
```
The system will ask for the destination branch, generate the content, and offer to `push` before opening the browser.

## ⚙️ Advanced Configuration

You can manage settings granularly without re-running the full setup assistant.

### Using the `config` command
- **List all settings**: `commitai config list`
- **Set a specific value**: `commitai config set commitLength short`
- **Get a value**: `commitai config get provider`

### Supported Keys
- `provider`: `openai`, `anthropic`, `deepseek`, `ollama`
- `model`: AI Model (e.g., `gpt-5-mini`, `claude-3-5-sonnet`)
- `language`: Output language (`en`, `pt-BR`, `es`)
- `commitLength`: `short` or `detailed`
- `emojis`: `true` or `false`
- `maxDiffLines`: Line limit for processing (Default: `600`)

## 🤖 Local AI with Ollama

CommitAI supports local execution using Ollama.
1. Install [Ollama](https://ollama.ai/).
2. Pull a model (e.g., `ollama pull llama3`).
3. Run `commitai init`, select `Ollama`, and enter `llama3` as the model.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- commit

# Build for production
npm run build

# Link globally for testing
npm link
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
