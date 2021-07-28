import { dequal } from "dequal/lite";

import {
  IResource,
  ResourceOptions,
  PromiseFn,
  RevocablePromise,
} from "./types";
import { addErroredResource } from "./errorBoundary";

export class Resource<Value, Args extends any[]>
  implements IResource<Value, Args>
{
  private promise?: RevocablePromise<void>;
  private result?: { value: Value };
  private error?: { reason: any };

  private listeners = new Set<() => void>();
  private unsubscribeOnMount?: () => void;

  constructor(
    public fn: PromiseFn<any, Args>,
    public args: Args,
    private opts: ResourceOptions<Args> = {}
  ) {
    if (opts.preload) {
      this.preload();
    }
  }

  read() {
    return this.load() as Value;
  }

  preload() {
    return this.load(true) as RevocablePromise<void>;
  }

  clear() {
    this.promise?.cancel?.();
    delete this.promise;
    delete this.result;
    delete this.error;
  }

  refresh() {
    if (this.error) this.clear();

    return this.result
      ? this.fn(...this.args).then((value) => this.setValue(value))
      : this.preload();
  }

  peek() {
    return this.result?.value;
  }

  put(value: Value) {
    this.setValue(value);
    if (this.promise) {
      this.promise.cancel?.();
    } else {
      this.promise = Promise.resolve();
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    if (!this.unsubscribeOnMount) {
      this.unsubscribeOnMount = this.opts.onMount?.(this);
    }

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.unsubscribeOnMount?.();
        delete this.unsubscribeOnMount;
      }
    };
  }

  private load(preload = false) {
    if (this.promise) {
      // If we're pre-loading and the element is present, just return
      if (preload) return this.promise;
      // If an error occurred, throw
      if (this.error) throw this.error.reason;
      // If a response was successful, return
      if (this.result) return this.result.value;
      // If the promise is still unresolved, throw
      throw this.promise;
    }

    this.promise = this.fn(...this.args)
      .then((value) => this.setValue(value))
      .catch((reason) => this.setError(reason))
      .then(() => {
        if (Number.isFinite(this.opts.lifespan)) {
          setTimeout(() => this.clear(), this.opts.lifespan);
        }
      });

    if (preload) return this.promise;

    // Suspense
    throw this.promise;
  }

  private setValue(value: Value) {
    delete this.error;
    if (!this.result || !dequal(value, this.result.value)) {
      this.result = { value };
      for (const notify of this.listeners) {
        try {
          notify();
        } catch {}
      }
    }
  }

  private setError(reason: any) {
    this.error = { reason };
    addErroredResource(this);
  }
}
