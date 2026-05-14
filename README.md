# @ericgenovez/commitai

**CommitAI** is a professional Command Line Interface (CLI) designed to automate and standardize your development workflow using Artificial Intelligence. It analyzes your changes and generates high-quality commit messages and Pull Request descriptions, following industry standards like **Conventional Commits**.

[![NPM Version](https://img.shields.io/npm/v/@ericgenovez/commitai.svg)](https://www.npmjs.com/package/@ericgenovez/commitai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

### [🇧🇷 Português](./README.pt-BR.md) | [🇪🇸 Español](./README.es.md)

---

## 🚀 Key Features

- **Modern Interface**: Premium terminal experience built with `@clack/prompts`, featuring continuous visual flows and vertical indicators.
- **Project Awareness**: Configure your **Project Stack/Context** (e.g., "React frontend with Tailwind") to help the AI provide more accurate and technically relevant descriptions.
- **Dynamic PR Templates**: Interactively select which sections to include in your Pull Request (What, Why, How to Test, Screenshots) on every run.
- **Standardized Commits**: Generates messages based on your `git diff --staged` using the Conventional Commits pattern.
- **Commit Mentor**: Suggests splitting large diffs into smaller, atomic commits for a cleaner project history.
- **Multi-Provider Support**: Choose between OpenAI, Anthropic (Claude), Google Gemini, DeepSeek, or local models via Ollama.
- **Global Localization**: Fully localized interface available in English, Portuguese, and Spanish.
- **Browser Integration**: Automatically opens PR creation pages on GitHub/GitLab with title and body pre-filled.
- **Interactive Editing**: Seamlessly integrates with your default terminal editor for manual fine-tuning.

## 📦 Installation

Install globally via NPM:

```bash
npm install -g @ericgenovez/commitai
```

### Usage via npx (without installation)

```bash
npx @ericgenovez/commitai commit
```

## 🛠️ Quick Start

### 1. Initial Setup

Configure your AI provider, API Key, and Project Context:

```bash
commitai init
```

### 2. Generate Commit Message

Stage your changes (`git add .`) and run:

```bash
commitai commit
```

The tool will present a suggestion. You can accept, edit in your terminal editor, or regenerate it.

### 3. Create a Pull Request

To generate a comprehensive PR description and open it in your browser:

```bash
commitai pr
```

Follow the prompts to select the target branch and the desired sections.

## ⚙️ Configuration

Manage all settings through a modern, interactive menu:

```bash
commitai config
```

### Available Options:

- **🤖 Configure AI Provider**: Sequentially set up Provider, Model, and API Key.
- **📁 Project Context**: Define your technology stack to improve AI precision.
- **🌐 Change CLI Language**: Instantly switch the interface language.
- **Adjust other settings**: Fine-tune emoji usage, commit styles, and line limits.

## 🤖 Local AI with Ollama

CommitAI supports local execution for privacy and cost savings:

1. Install [Ollama](https://ollama.ai/).
2. Pull your preferred model (e.g., `ollama pull llama3`).
3. Run `commitai init`, select **Ollama**, and enter `llama3` as the model.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Link globally for testing
npm link
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
