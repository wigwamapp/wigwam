import { AmplitudeCore, Destination } from "@amplitude/analytics-core";
import { NodeConfig } from "@amplitude/analytics-types";

import { ExtConfig } from "./config";
import { ExtContext } from "./context";

export class AmplitudeClient extends AmplitudeCore<NodeConfig> {
  async init(apiKey: string, userId?: string) {
    const extOptions = new ExtConfig(apiKey, userId);

    await super._init(extOptions);

    await this.add(new ExtContext());
    await this.add(new Destination());
  }
}
