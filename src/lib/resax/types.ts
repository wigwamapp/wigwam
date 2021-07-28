export interface IResource<Value = unknown, Args extends any[] = unknown[]> {
  args: Args;

  read(): Value;
  preload(): RevocablePromise<void>;
  clear(): void;
  refresh(): RevocablePromise<void>;
  peek(): Value | undefined;
  put(value: Value): void;
  subscribe(listener: () => void): () => void;
}

export type ResourceOptions<Args extends any[], Value = any> = Partial<{
  lifespan: number;
  preload: boolean;
  onMount: (resource: IResource<Value, Args>) => () => void;
}>;

export type ResourceValue<R> = ReturnType<Extract<R, IResource>["read"]>;

export type PromiseFn<Value, Args extends any[]> = (
  ...args: Args
) => RevocablePromise<Value>;

export interface RevocablePromise<T> extends Promise<T> {
  cancel?: () => void;
}
