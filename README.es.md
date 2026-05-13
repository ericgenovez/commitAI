# @ericgenovez/commitai

**CommitAI** es una interfaz de línea de comandos (CLI) profesional diseñada para automatizar y estandarizar los flujos de trabajo de Git utilizando Inteligencia Artificial. Analiza sus cambios y genera mensajes de commit y descripciones de Pull Request de alta calidad siguiendo estándares de la industria como **Conventional Commits**.

[![NPM Version](https://img.shields.io/npm/v/@ericgenovez/commitai.svg)](https://www.npmjs.com/package/@ericgenovez/commitai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

### [🇺🇸 English](./README.md) | [🇧🇷 Português](./README.pt-BR.md)

---

## 🚀 Funcionalidades Principales

- **Commits Estandarizados**: Genera mensajes basados en su `git diff --staged` utilizando el patrón Conventional Commits.
- **Mentor de Commits**: Sugiere dividir commits grandes para mantener un historial atómico y organizado.
- **Descripciones de PR Inteligentes**: Compara ramas y genera descripciones detalladas automáticamente.
- **Integración con el Navegador**: Abre las páginas de creación de PR en GitHub/GitLab con el título y la descripción completados.
- **Edición Interactiva**: Se integra con su editor predeterminado (VS Code, Vim, etc.) para revisiones manuales.
- **Localización Global**: Toda la interfaz de la CLI está disponible en inglés, portugués y español.
- **Soporte Multi-Proveedor**: Soporta OpenAI, Anthropic, Google Gemini, DeepSeek y modelos locales vía Ollama.
- **Optimización de Costos**: Ignora automáticamente lockfiles y binarios para ahorrar tokens.

## 📦 Instalación

Instalación global a través de NPM:

```bash
npm install -g @ericgenovez/commitai
```

### Uso a través de npx (sin instalación)

```bash
npx @ericgenovez/commitai commit
```

## 🛠️ Guía de Uso

### 1. Configuración Inicial

Ejecute el siguiente comando para configurar su proveedor de IA y su API Key:

```bash
commitai init
```

### 2. Generar Mensaje de Commit

Después de agregar sus archivos al stage (`git add .`), ejecute:

```bash
commitai commit
```

La herramienta presentará una sugerencia. Puede aceptarla, editarla en su editor predeterminado o regenerarla.

### 3. Generar Pull Request

Para crear una descripción de PR y abrirla en el navegador:

```bash
commitai pr
```

El sistema le preguntará por la rama de destino, generará el contenido y le ofrecerá realizar un `push` antes de abrir el navegador.

## ⚙️ Configuración Avanzada

Puede administrar los ajustes a través de un menú interactivo completo.

### Usando el comando `config`

Simplemente ejecute:

```bash
commitai config
```

Esto abrirá un menú interactivo donde puede:

- **🤖 Configurar Proveedor de IA**: Flujo unificado para cambiar Proveedor, Modelo y API Key de una sola vez.
- **🌐 Cambiar Idioma del CLI**: Cambia instantáneamente el idioma de la interfaz del terminal.
- **Ajustar otras opciones**: Refinar el uso de emojis, estilo de commit, convenciones y más.

### Claves Soportadas (para uso vía CLI)

- `provider`: `openai`, `anthropic`, `gemini`, `deepseek`, `ollama`
- `model`: Modelo de IA (ej: `gpt-5-mini`, `gemini-2.0-flash`, `claude-3-5-sonnet`)
- `language`: Idioma de salida de la IA (`en`, `pt-BR`, `es`)
- `cliLanguage`: Idioma de la interfaz del terminal (`en`, `pt-BR`, `es`)
- `commitLength`: `short` o `detailed`
- `emojis`: `true` o `false`
- `maxDiffLines`: Límite de líneas procesadas (Predeterminado: `600`)

## 🤖 IA Local con Ollama

CommitAI admite la ejecución local mediante Ollama.

1. Instale [Ollama](https://ollama.ai/).
2. Descargue un modelo (ej: `ollama pull llama3`).
3. Ejecute `commitai init`, seleccione `Ollama` e ingrese `llama3` como modelo.

## 🛠️ Desarrollo

```bash
# Instalar dependências
npm install

# Ejecutar en modo de desarrollo
npm run dev -- commit

# Build para producción
npm run build

# Enlace global para pruebas
npm link
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulte el archivo [LICENSE](LICENSE) para más detalles.
