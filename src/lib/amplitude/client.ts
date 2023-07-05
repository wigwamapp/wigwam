import { AmplitudeCore, Destination } from "@amplitude/analytics-core";

import { ExtConfig } from "./config";
import { ExtContext } from "./context";

export class AmplitudeClient extends AmplitudeCore {
  async init(apiKey: string, userId?: string) {
    const extOptions = new ExtConfig(apiKey, userId);

    await super._init(extOptions);

    await this.add(new ExtContext()).promise;
    await this.add(new Destination()).promise;
  }
}
