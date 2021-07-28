import { dequal } from "dequal/lite";

import { IResource, ResourceOptions, PromiseFn } from "./types";
import { Resource } from "./resource";

export function resource<Value>(
  fn: PromiseFn<Value, []>,
  opts?: ResourceOptions<[], Value>
): IResource<Value, []> {
  return new Resource<Value, []>(fn, [], opts);
}

export function resourceFactory<PromiseValue, Args extends any[]>(
  fn: PromiseFn<PromiseValue, Args>,
  opts?: ResourceOptions<Args, PromiseValue>
) {
  const cache = new Set<IResource<any, Args>>();

  const factory = <Value = PromiseValue>(
    ...args: Args
  ): IResource<Value, Args> => {
    for (const resource of cache) {
      if (dequal(args, resource.args)) {
        return resource;
      }
    }

    const resource = new Resource<Value, Args>(fn, args, opts);
    cache.add(resource);
    return resource;
  };
  factory.clear = () => cache.clear();

  return factory;
}
