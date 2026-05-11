# CommitAI

O CommitAI é uma ferramenta de linha de comando (CLI) profissional projetada para automatizar fluxos de trabalho do Git usando Inteligência Artificial. Ele analisa suas alterações e gera mensagens de commit de alta qualidade e descrições de Pull Request diretamente do terminal.

## Funcionalidades

- **Commits Inteligentes:** Gera mensagens baseadas no seu `git diff --staged` seguindo o padrão Conventional Commits.
- **Descrições de PR:** Cria descrições abrangentes comparando branches automaticamente.
- **Suporte Multi-Provedor:** Integração com OpenAI, Anthropic (Claude), DeepSeek e modelos locais via Ollama.
- **Fluxo Interativo:** Revise, escreva manualmente ou peça para a IA regenerar antes de confirmar.
- **Segurança:** Chaves sensíveis são gerenciadas via variáveis de ambiente ou arquivos de configuração locais.

## Instalação

Instale como uma dependência de desenvolvimento no seu projeto:

```bash
npm install --save-dev github:ericgenovez/commitAI
```

Ou utilize sem instalação via `npx`:

```bash
npx github:ericgenovez/commitAI commit
```

## Configuração

A ferramenta prioriza variáveis de ambiente. Crie um arquivo `.env` na raiz do seu projeto:

```env
COMMITAI_API_KEY=sua_chave_aqui
```

Você também pode definir comportamentos customizados em `.commitai/config.json`:

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "language": "pt-BR",
  "emojis": true
}
```

## Uso

### Gerar Commit
Analisa os arquivos no stage e sugere uma mensagem:
```bash
commitai commit
```

### Gerar Descrição de PR
Compara a branch atual com uma branch de destino (ex: main) e gera a descrição:
```bash
commitai pr
```

## Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](LICENSE) para detalhes.
