export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function errorName(error: unknown): string {
  return error instanceof Error ? error.name : '';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
