import { createQueue } from "lib/system/queue";

const queues = new Map<string, ReturnType<typeof createQueue>>();

export function enqueueTokensSync<T>(
  accountAddress: string,
  factory: () => Promise<T>,
): Promise<T> {
  if (!queues.has(accountAddress)) {
    queues.set(accountAddress, createQueue());
  }

  return queues.get(accountAddress)!(factory);
}
