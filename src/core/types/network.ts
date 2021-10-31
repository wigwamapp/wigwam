export type RpcResponse =
  | { result: any }
  | { error: Partial<{ message: string; code: number; data: any }> };
