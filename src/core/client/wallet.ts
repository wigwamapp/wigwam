import { assert } from "lib/system/assert";
import { toProtectedPassword } from "lib/crypto-utils";
import {
  EventMessage,
  MessageType,
  WalletStatus,
  AddAccountParams,
  SeedPharse,
  Account,
  Sync,
  SyncStatus,
  FindToken,
  SyncTokenActivities,
  TokenType,
} from "core/types";

import { porter } from "./base";

export async function getWalletState() {
  const type = MessageType.GetWalletState;
  const res = await porter.request(
    { type },
    {
      // This request is base, it's called first
      // If no answer during this time - there is a possibility
      // that the Service Worker has stalled or smth happen
      // So, let's not delay the user
      timeout: 5_000,
    },
  );
  assert(res?.type === type);

  const { walletStatus, hasSeedPhrase } = res;
  return { walletStatus, hasSeedPhrase };
}

export function onWalletStateUpdated(
  callback: (s: { walletStatus: WalletStatus; hasSeedPhrase: boolean }) => void,
) {
  return porter.onOneWayMessage<EventMessage>((msg) => {
    if (msg?.type === MessageType.WalletStateUpdated) {
      const { walletStatus, hasSeedPhrase } = msg;
      callback({ walletStatus, hasSeedPhrase });
    }
  });
}

export function onAccountsUpdated(callback: (newAccounts: Account[]) => void) {
  return porter.onOneWayMessage<EventMessage>((msg) => {
    if (msg?.type === MessageType.AccountsUpdated) {
      callback(msg.accounts);
    }
  });
}

export async function setupWallet(
  password: string,
  accountsParams: AddAccountParams[],
  seedPhrase?: SeedPharse,
) {
  password = await toProtectedPassword(password);

  const type = MessageType.SetupWallet;

  const res = await porter.request({
    type,
    password,
    accountsParams,
    seedPhrase,
  });
  assert(res?.type === type);
}

export async function unlockWallet(password: string) {
  password = await toProtectedPassword(password);

  const type = MessageType.UnlockWallet;

  const res = await porter.request({
    type,
    password,
  });
  assert(res?.type === type);
}

export async function lockWallet() {
  const type = MessageType.LockWallet;

  const res = await porter.request({ type });
  assert(res?.type === type);
}

export async function changePassword(
  currentPassword: string,
  nextPassword: string,
) {
  currentPassword = await toProtectedPassword(currentPassword);
  nextPassword = await toProtectedPassword(nextPassword);

  const type = MessageType.ChangePassword;

  const res = await porter.request({ type, currentPassword, nextPassword });
  assert(res?.type === type);
}

export async function getAccounts() {
  const type = MessageType.GetAccounts;

  const res = await porter.request({ type });
  assert(res?.type === type);

  return res.accounts;
}

export async function addAccounts(
  accountsParams: AddAccountParams[],
  seedPhrase?: SeedPharse,
) {
  const type = MessageType.AddAccounts;

  const res = await porter.request({
    type,
    accountsParams,
    seedPhrase,
  });
  assert(res?.type === type);
}

export async function deleteAccounts(password: string, accountUuids: string[]) {
  password = await toProtectedPassword(password);

  const type = MessageType.DeleteAccounts;

  const res = await porter.request({
    type,
    password,
    accountUuids,
  });
  assert(res?.type === type);
}

export async function updateAccountName(accountUuid: string, name: string) {
  const type = MessageType.UpdateAccountName;

  const res = await porter.request({
    type,
    accountUuid,
    name,
  });
  assert(res?.type === type);
}

export async function getSeedPhrase(password: string) {
  password = await toProtectedPassword(password);

  const type = MessageType.GetSeedPhrase;

  const res = await porter.request({
    type,
    password,
  });
  assert(res?.type === type);

  return res.seedPhrase;
}

export async function getPrivateKey(password: string, accountUuid: string) {
  password = await toProtectedPassword(password);

  const type = MessageType.GetPrivateKey;

  const res = await porter.request({
    type,
    password,
    accountUuid,
  });
  assert(res?.type === type);

  return res.privateKey;
}

export async function getPublicKey(accountUuid: string) {
  const type = MessageType.GetPublicKey;

  const res = await porter.request({
    type,
    accountUuid,
  });
  assert(res?.type === type);

  return res.publicKey;
}

export async function getNeuterExtendedKey(derivationPath: string) {
  const type = MessageType.GetNeuterExtendedKey;

  const res = await porter.request({ type, derivationPath });
  assert(res?.type === type);

  return res.extendedKey;
}

export async function getSyncStatus() {
  const type = MessageType.GetSyncStatus;

  const res = await porter.request({ type });
  assert(res?.type === type);

  return res.status;
}

export function onSyncStatusUpdated(callback: (status: SyncStatus) => void) {
  return porter.onOneWayMessage<EventMessage>((msg) => {
    if (msg?.type === MessageType.SyncStatusUpdated) {
      callback(msg.status);
    }
  });
}

export function sync(
  chainId: number,
  accountAddress: string,
  tokenType: TokenType,
) {
  const msg: Sync = {
    type: MessageType.Sync,
    chainId,
    accountAddress,
    tokenType,
  };

  porter.sendOneWayMessage(msg);
}

export function findToken(
  chainId: number,
  accountAddress: string,
  tokenSlug: string,
  refreshMetadata?: boolean,
) {
  const msg: FindToken = {
    type: MessageType.FindToken,
    chainId,
    accountAddress,
    tokenSlug,
    refreshMetadata,
  };

  porter.sendOneWayMessage(msg);
}

export function syncTokenActivities(
  chainId: number,
  accountAddress: string,
  tokenSlug: string,
) {
  const msg: SyncTokenActivities = {
    type: MessageType.SyncTokenActivities,
    chainId,
    accountAddress,
    tokenSlug,
  };

  porter.sendOneWayMessage(msg);
}

export async function getGasPrices(chainId: number) {
  const type = MessageType.GetGasPrices;

  const res = await porter.request({ type, chainId });
  assert(res?.type === type);

  return res.gasPrices;
}

export async function getOnRampCurrencies() {
  const type = MessageType.GetOnRampCurrencies;

  const res = await porter.request({ type });
  assert(res?.type === type);

  return res.currencies;
}

export async function getTokenDetailsUrl(chainId: number, tokenSlug: string) {
  const type = MessageType.GetTokenDetailsUrl;

  const res = await porter.request({ type, chainId, tokenSlug });
  assert(res?.type === type);

  return res.detailsUrl;
}
