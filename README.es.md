# @ericgenovez/commitai

**CommitAI** es una interfaz de línea de comandos (CLI) profesional diseñada para automatizar y estandarizar su flujo de trabajo de desarrollo utilizando Inteligencia Artificial. Analiza sus cambios y genera mensajes de commit y descripciones de Pull Request de alta calidad, siguiendo estándares de la industria como **Conventional Commits**.

[![NPM Version](https://img.shields.io/npm/v/@ericgenovez/commitai.svg)](https://www.npmjs.com/package/@ericgenovez/commitai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

### [🇺🇸 English](./README.md) | [🇧🇷 Português](./README.pt-BR.md)

---

## 🚀 Funcionalidades Principales

- **Interfaz Moderna**: Experiencia de terminal premium construida con `@clack/prompts`, con flujos visuales continuos e indicadores verticales.
- **Contexto del Proyecto**: Configure el **Stack/Contexto del Proyecto** (ej: "Frontend React con Tailwind") para que la IA genere descripciones técnicamente más precisas y relevantes.
- **Plantillas Dinámicas de PR**: Seleccione interactivamente qué secciones incluir en su Pull Request (Qué cambió, Por qué cambiar, Cómo probar, Capturas de pantalla) en cada ejecución.
- **Commits Estandarizados**: Genera mensajes basados en su `git diff --staged` utilizando el patrón Conventional Commits.
- **Mentor de Commits**: Sugiere dividir grandes cambios en commits más pequeños y atómicos para un historial de proyecto más limpio.
- **Soporte Multi-Proveedor**: Elija entre OpenAI, Anthropic (Claude), Google Gemini, DeepSeek o modelos locales vía Ollama.
- **Localización Global**: Interfaz totalmente localizada en español, inglés y portugués.
- **Integración con Navegador**: Abre automáticamente las páginas de creación de PR en GitHub/GitLab con el título y el cuerpo completados.
- **Edición Interactiva**: Integración transparente con el editor predeterminado de su terminal para ajustes manuales rápidos.

## 📦 Instalación

Instalación global a través de NPM:

```bash
npm install -g @ericgenovez/commitai
```

### Uso a través de npx (sin instalación)

```bash
npx @ericgenovez/commitai commit
```

## 🛠️ Guía Rápida

### 1. Configuración Inicial

Configure su proveedor de IA, API Key y el contexto de su proyecto:

```bash
commitai init
```

### 2. Generar Mensaje de Commit

Agregue sus archivos al stage (`git add .`) y ejecute:

```bash
commitai commit
```

La herramienta presentará una sugerencia. Puede aceptarla, editarla en su editor de terminal o generarla de nuevo.

### 3. Crear un Pull Request

Para generar una descripción completa de PR y abrirla en el navegador:

```bash
commitai pr
```

Siga las instrucciones para seleccionar la rama de destino y las secciones deseadas.

## ⚙️ Configuración

Administre todos los ajustes a través de un menú interactivo moderno:

```bash
commitai config
```

### Opciones Disponibles:

- **🤖 Configurar Proveedor de IA**: Configure secuencialmente Proveedor, Modelo y API Key.
- **📁 Contexto del Proyecto**: Defina su stack tecnológico para mejorar la precisión de la IA.
- **🌐 Cambiar Idioma del CLI**: Cambie instantáneamente el idioma de la interfaz.
- **Ajustar otras opciones**: Refine el uso de emojis, estilos de commit y límites de líneas.

## 🤖 IA Local con Ollama

CommitAI admite la ejecución local para mayor privacidad y ahorro de costos:

1. Instale [Ollama](https://ollama.ai/).
2. Descargue el modelo deseado (ej: `ollama pull llama3`).
3. Ejecute `commitai init`, seleccione **Ollama** e ingrese `llama3` como modelo.

## 🛠️ Desarrollo

```bash
# Instalar dependencias
npm install

# Construir para producción
npm run build

# Enlazar globalmente para pruebas
npm link
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulte el archivo [LICENSE](LICENSE) para más detalles.
