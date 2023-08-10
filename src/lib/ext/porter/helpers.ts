import { Runtime } from "webextension-polyfill";
import { PorterMessageType } from "./types";

export const MESSAGE_TYPES = Object.values(PorterMessageType);

export const DEFAULT_ERROR_MESSAGE = "Unexpected error occured";
export const TIMEOUT_ERROR_MESSAGE = "Timeout";
export const DISCONNECTED_ERROR_MESSAGE = "Disconnected";

export interface SerializedError {
  message: string;
  data?: any;
}

export function sanitizeMessage(msg: any) {
  if (process.env.TARGET_BROWSER !== "firefox") return msg;

  // Fix firefox bug: The object could not be cloned
  try {
    return JSON.parse(JSON.stringify(msg));
  } catch {
    return msg;
  }
}

export function getPortId(port: Runtime.Port) {
  return port.name.split("_")[1];
}

export function serializeError(err: any): SerializedError {
  const message = err?.message || DEFAULT_ERROR_MESSAGE;
  return { message, data: err?.data };
}

export function deserializeError({ message, data }: SerializedError) {
  return new PorterError(message, data);
}

export class PorterError extends Error {
  name = "PorterError";

  constructor(
    message: string,
    public data?: any,
  ) {
    super(message);
  }
}

export class PorterTimeoutError extends PorterError {
  name = "PorterTimeoutError";

  constructor() {
    super(TIMEOUT_ERROR_MESSAGE);
  }
}

export class PorterDisconnectedError extends PorterError {
  name = "PorterDisconnectedError";

  constructor() {
    super(DISCONNECTED_ERROR_MESSAGE);
  }
}
