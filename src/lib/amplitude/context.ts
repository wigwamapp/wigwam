import { UUID } from "@amplitude/analytics-core";
import { BeforePlugin, Event } from "@amplitude/analytics-types";
import UAParser from "@amplitude/ua-parser-js";

import { IExtConfig } from "./config";

export class ExtContext implements BeforePlugin {
  name = "context";
  type = "before" as const;

  // this.config is defined in setup() which will always be called first
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  config: IExtConfig;
  eventId = 0;
  uaResult: any;

  constructor() {
    this.uaResult = new UAParser(window.navigator?.userAgent).getResult();
  }

  setup(config: IExtConfig): Promise<undefined> {
    this.config = config;
    return Promise.resolve(undefined);
  }

  execute(context: Event): Promise<Event> {
    return new Promise((resolve) => {
      const time = Date.now();
      const osName = this.uaResult.browser.name;
      const osVersion = this.uaResult.browser.version;
      const deviceModel = this.uaResult.device.model || this.uaResult.os.name;

      const contextEvent: Event = {
        user_id: this.config.userId,
        device_id: this.config.deviceId,
        session_id: this.config.sessionId,
        time,
        app_version: this.config.appVersion,
        os_name: osName,
        os_version: osVersion,
        device_model: deviceModel,
        insert_id: UUID(),
        partner_id: this.config.partnerId,
        ...context,
        event_id: this.eventId++,
      };

      return resolve(contextEvent);
    });
  }
}
