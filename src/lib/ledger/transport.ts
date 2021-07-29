/* eslint-disable */

import Transport from "@ledgerhq/hw-transport";

export const LedgerTransport: typeof Transport =
  process.env.TARGET_BROWSER === "chrome"
    ? require("@ledgerhq/hw-transport-webhid").default
    : require("@ledgerhq/hw-transport-webauthn").default;
