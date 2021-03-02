export const DEFAULT_ERROR_MESSAGE = "Unexpected error occured";

export interface SerializedError {
  message: string;
  data?: any;
}

export function serializeError(err: any): SerializedError {
  const message = err?.message || DEFAULT_ERROR_MESSAGE;
  return { message, data: err?.data };
}

export function deserializeError({ message, data }: SerializedError) {
  return new IntercomError(message, data);
}

export class IntercomError implements Error {
  name = "IntercomError";

  constructor(public message: string, public data?: any) {}
}
