import { Config, MemoryStorage } from "@amplitude/analytics-core";
import {
  Config as IConfig,
  NodeOptions,
  Event,
  LogLevel,
} from "@amplitude/analytics-types";

import { SendBeaconTransport } from "./transport";

export interface IExtConfig extends IConfig {
  appVersion?: string;
  deviceId?: string;
  partnerId?: string;
  sessionId?: number;
  sessionTimeout: number;
  userId?: string;
}

export class ExtConfig extends Config {
  userId?: string;
  appVersion?: string;
  deviceId?: string;
  partnerId?: string;
  sessionId?: number;
  sessionTimeout?: number;

  constructor(apiKey: string, userId?: string, options?: NodeOptions) {
    const storageProvider =
      options?.storageProvider ?? new MemoryStorage<Event[]>();
    const transportProvider =
      options?.transportProvider ?? new SendBeaconTransport();
    const logLevel =
      process.env.RELEASE_ENV === "true" ? LogLevel.None : LogLevel.Verbose;

    super({
      ...options,
      apiKey,
      storageProvider,
      transportProvider,
      flushIntervalMillis: 150,
      logLevel,
    });

    this.userId = userId;
    this.appVersion = process.env.VERSION;
  }
}
