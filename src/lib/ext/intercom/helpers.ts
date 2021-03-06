import { IntercomMessageType } from "./types";

export const MESSAGE_TYPES = Object.values(IntercomMessageType);

export const DEFAULT_ERROR_MESSAGE = "Unexpected error occured";
export const TIMEOUT_ERROR_MESSAGE = "Timeout";

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

export class IntercomError extends Error {
  name = "IntercomError";

  constructor(message: string, public data?: any) {
    super(message);
  }
}

export class IntercomTimeoutError extends IntercomError {
  name = "IntercomTimeoutError";

  constructor() {
    super(TIMEOUT_ERROR_MESSAGE);
  }
}
