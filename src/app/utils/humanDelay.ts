export async function withHumanDelay<T>(
  factory: () => Promise<T>,
  delay = 500,
) {
  const srartedAt = Date.now();

  try {
    return await factory();
  } finally {
    const ms = srartedAt + delay - Date.now();
    if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  }
}
