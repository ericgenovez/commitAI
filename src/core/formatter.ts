export class Formatter {
  /**
   * Remove blocos de código markdown, espaços extras e quebras de linha desnecessárias
   * que a IA possa ter retornado.
   */
  static cleanResponse(text: string): string {
    return text
      .replace(/```[a-z]*\n([\s\S]*?)\n```/g, '$1') // Remove blocos de código
      .replace(/^(Commit message:|Message:|Output:)/i, '') // Remove prefixos comuns
      .trim();
  }
}
