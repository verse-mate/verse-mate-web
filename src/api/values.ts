export function textOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}
