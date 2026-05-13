import { z } from 'zod';

export const ConfigSchema = z.object({
  provider: z
    .enum(['openai', 'anthropic', 'deepseek', 'ollama'])
    .default('openai'),
  model: z.string().default('gpt-5-mini'),
  apiKey: z.string().optional(),
  language: z.string().default('pt-BR'),
  convention: z
    .enum(['conventional', 'angular', 'karma'])
    .default('conventional'),
  emojis: z.boolean().default(true),
  commitLength: z.enum(['short', 'detailed']).default('detailed'),
  maxDiffLines: z.number().positive().default(600),
  projectContext: z.string().optional(),
  prTemplate: z
    .object({
      sections: z
        .array(z.string())
        .default(['what', 'why', 'how-to-test', 'screenshots']),
    })
    .default({
      sections: ['what', 'why', 'how-to-test', 'screenshots'],
    }),
});

export type CommitAIConfig = z.infer<typeof ConfigSchema>;
