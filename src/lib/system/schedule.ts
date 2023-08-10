export async function schedule(
  notMoreOftenThan: number,
  factory: () => Promise<void>,
) {
  const startedAt = Date.now();
  try {
    await factory();
  } catch (err) {
    console.error(err);
  } finally {
    const scheduleThrough = Math.max(
      notMoreOftenThan - (Date.now() - startedAt),
      0,
    );
    setTimeout(schedule, scheduleThrough, notMoreOftenThan, factory);
  }
}
