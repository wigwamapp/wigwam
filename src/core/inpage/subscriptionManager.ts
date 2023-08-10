import { Emitter } from "lib/emitter";

import { ETH_SUBSCRIPTION } from "core/common/rpc";

import type { InpageProvider } from "./provider";
import type { FilterManager } from "./filterManager";

enum SubType {
  newHeads = "newHeads",
  logs = "logs",
}

type Subscription = { type: SubType; filterId: string };

export class SubscriptionManager extends Emitter {
  private subscriptions = new Map<string, Subscription>();

  constructor(
    private provider: InpageProvider,
    private filter: FilterManager,
  ) {
    super();

    this.checkChangesAndDefer();
    this.provider.on("networkChanged", () => this.subscriptions.clear());
  }

  private checkChangesAndDefer() {
    for (const [id, { type, filterId }] of this.subscriptions) {
      const handleEmit = (results: unknown) => {
        if (Array.isArray(results) && results.length > 0) {
          for (const result of results) {
            this.emit("message", {
              type: ETH_SUBSCRIPTION,
              data: {
                subscription: id,
                result,
              },
            });
          }
        }
      };

      switch (type) {
        case SubType.newHeads:
          this.filter
            .getFilterChanges(filterId, true)
            .then(handleEmit)
            .catch(console.error);
          break;

        case SubType.logs:
          this.filter
            .getFilterChanges(filterId)
            .then(handleEmit)
            .catch(console.error);
          break;

        default:
          break;
      }
    }

    setTimeout(() => this.checkChangesAndDefer(), 5_000);
  }

  async subscribe(params: any[]) {
    const subscriptionType = params[0];
    const subId = unsafeRandomBytes(16);

    switch (subscriptionType) {
      case SubType.newHeads: {
        const filterId = await this.filter.newBlockFilter();
        this.subscriptions.set(subId, { type: SubType.newHeads, filterId });

        return subId;
      }

      case SubType.logs: {
        const { address, topics } = params[1];
        const filterId = await this.filter.newFilter({ address, topics });
        this.subscriptions.set(subId, { type: SubType.logs, filterId });

        return subId;
      }

      default:
        throw new Error(
          `SubscriptionManager - unsupported subscription type "${subscriptionType}"`,
        );
    }
  }

  unsubscribe(params: any[]) {
    const id = params[0];

    const sub = this.subscriptions.get(id);
    if (!sub) return false;

    this.subscriptions.delete(id);

    return this.filter.uninstallFilter(sub.filterId);
  }
}

function unsafeRandomBytes(byteCount: number) {
  let result = "0x";
  for (let i = 0; i < byteCount; i++) {
    result += unsafeRandomNibble();
    result += unsafeRandomNibble();
  }
  return result;
}

function unsafeRandomNibble() {
  return Math.floor(Math.random() * 16).toString(16);
}
