import memoizeOne from "memoize-one";
import { AmplitudeClient } from "lib/amplitude";
import { storage } from "lib/ext/storage";

import { Setting, AnalyticsState } from "core/common/settings";

export enum TEvent {
  Promocode = "PROMOCODE_USED",
  SetupWallet = "SETUP_WALLET",
  SetupVigvam = "SETUP_VIGVAM",
  ProfileCreation = "PROFILE_CREATION",
  ProfileUpdate = "PROFILE_UPDATE",
  NetworkChange = "NETWORK_CHANGE",
  NetworkCreation = "NETWORK_CREATION",
  NetworkEdit = "NETWORK_EDIT",
  Contact = "CONTACT_CREATION",
  Transfer = "TRANSFER_CREATION",
  DappConnect = "DAPP_CONNECT",
  DappSigning = "DAPP_SIGNING",
  DappTransaction = "DAPP_TRANSACTION",
}

export const trackEvent: AmplitudeClient["track"] = async (
  ...args
): Promise<any> => {
  const amplitued = await getAmplitude();

  return amplitued?.track(...args);
};

const getAmplitude = memoizeOne(async () => {
  const apiKey = process.env.VIGVAM_ANALYTICS_API_KEY;
  const state = await storage.fetchForce<AnalyticsState>(Setting.Analytics);

  if (!apiKey || !state?.enabled) return null;

  try {
    const client = new AmplitudeClient();
    await client.init(apiKey, state.userId);

    return client;
  } catch (err) {
    console.error(err);
    return null;
  }
});

storage.subscribe(Setting.Analytics, () => getAmplitude.clear());
