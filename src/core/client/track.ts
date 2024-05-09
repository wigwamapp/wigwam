import memoizeOne from "memoize-one";
import { AmplitudeClient } from "lib/amplitude";
import { storage } from "lib/ext/storage";

import { Setting, AnalyticsState } from "core/common/settings";

export enum TEvent {
  SetupWallet = "WALLET_SETUPED",
  SetupWigwam = "WIGWAM_SETUPED",
  ProfileCreation = "PROFILE_CREATED",
  ProfileUpdate = "PROFILE_UPDATED",
  NetworkChange = "NETWORK_CHANGED",
  NetworkCreation = "NETWORK_CREATED",
  NetworkEdit = "NETWORK_EDITED",
  Contact = "CONTACT_CREATED",
  DappConnect = "DAPP_CONNECT_OPENED",
  DappSigning = "DAPP_SIGNING_OPENED",
  DappTransaction = "DAPP_TRANSACTION_OPENED",
  SwapNavigated = "SWAP_NAVIGATED",
  SwapStarted = "SWAP_STARTED",
  SwapFinished = "SWAP_FINISHED",
  BuyNavigated = "BUY_NAVIGATED",
  BuyStarted = "BUY_STARTED",
  BuyFinished = "BUY_FINISHED",
  TokenTransferCreated = "TOKEN_TRANSFER_CREATED",
  NftTransferCreated = "NFT_TRANSFER_CREATED",
  ReceiveModalOpened = "RECEIVE_MODAL_OPENED",
  SidebarNavigated = "SIDEBAR_NAVIGATED",
  Web3SharedModeToggled = "WEB3_SHARED_MODE_TOGGLED",
  Web3ManualConnected = "WEB3_MANUAL_CONNECTED",
}

export const trackEvent = async (
  ...args: Parameters<AmplitudeClient["track"]>
): Promise<any> => {
  const amplitued = await getAmplitude();

  return amplitued?.track(...args).promise.then((result) => {
    console.info("Tracked:", ...args);
    return result;
  });
};

export const isTrackingEnabled = () => getAmplitude().then(Boolean);

const getAmplitude = memoizeOne(async () => {
  const apiKey = process.env.WIGWAM_ANALYTICS_API_KEY;
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
