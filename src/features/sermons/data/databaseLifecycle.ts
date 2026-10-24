let replacement: Promise<void> | null = null;

/** Prevent a status check from reopening the old database during a file swap. */
export async function waitForDatabaseReplacement(): Promise<void> {
  while (replacement) await replacement;
}

export async function withDatabaseReplacement<T>(operation: () => Promise<T>): Promise<T> {
  while (replacement) await replacement;
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  replacement = pending;
  try {
    return await operation();
  } finally {
    if (replacement === pending) replacement = null;
    release();
  }
}
