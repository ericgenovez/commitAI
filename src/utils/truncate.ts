/**
 * Trunca uma string se ela exceder o número máximo de linhas.
 */
export function truncateDiff(diff: string, maxLines: number): string {
  const lines = diff.split('\n');
  
  if (lines.length <= maxLines) {
    return diff;
  }

  return lines.slice(0, maxLines).join('\n') + '\n\n[Diff truncated... Total lines: ' + lines.length + ']';
}
