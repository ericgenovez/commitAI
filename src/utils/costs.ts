/**
 * Model Pricing per 1M tokens in USD
 * Prices as of May 2026
 */
export const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  'gpt-5-mini': { input: 0.15, output: 0.60 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'claude-3-5-sonnet': { input: 3.00, output: 15.00 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
  'deepseek-chat': { input: 0.14, output: 0.28 },
  'default': { input: 0.15, output: 0.60 },
};

export interface Usage {
  promptTokens: number;
  completionTokens: number;
}

/**
 * Calculates the estimated USD cost for a given usage.
 */
export function calculateCost(model: string, usage: Usage): number {
  const pricing = MODEL_PRICES[model] || MODEL_PRICES['default'];
  const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Formats token usage for display.
 */
export function formatUsage(usage: Usage): string {
  const total = usage.promptTokens + usage.completionTokens;
  return `Tokens: ${total} (↑${usage.promptTokens} ↓${usage.completionTokens})`;
}

/**
 * Returns information about the model tier.
 */
export function getModelTier(model: string): string {
  if (model.includes('mini') || model.includes('haiku') || model.includes('deepseek')) {
    return 'Modelo: Classe Eficiência';
  }
  return 'Modelo: Classe Performance';
}

