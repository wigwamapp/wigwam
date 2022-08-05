import { createQueue } from "lib/system/queue";

const queues = new Map<number, ReturnType<typeof createQueue>>();

export function enqueueTokensSync<T>(
  chainId: number,
  factory: () => Promise<T>
): Promise<T> {
  if (!queues.has(chainId)) {
    queues.set(chainId, createQueue());
  }

  return queues.get(chainId)!(factory);
}
