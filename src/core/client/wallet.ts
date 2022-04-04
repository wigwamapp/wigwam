import { assert } from "lib/system/assert";
import { toProtectedString } from "lib/crypto-utils";
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
} from "core/types";

import { porter } from "./base";

export async function getWalletStatus() {
  const type = MessageType.GetWalletStatus;
  const res = await porter.request({ type });
  assert(res?.type === type);
  return res.status;
}

export function onWalletStatusUpdated(
  callback: (newWalletStatus: WalletStatus) => void
) {
  return porter.onOneWayMessage<EventMessage>((msg) => {
    if (msg?.type === MessageType.WalletStatusUpdated) {
      callback(msg.status);
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
  seedPhrase?: SeedPharse
) {
  password = toProtectedString(password);

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
  password = toProtectedString(password);

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
  nextPassword: string
) {
  currentPassword = toProtectedString(currentPassword);
  nextPassword = toProtectedString(nextPassword);

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

export async function addAccounts(accountsParams: AddAccountParams[]) {
  const type = MessageType.AddAccounts;

  const res = await porter.request({
    type,
    accountsParams,
  });
  assert(res?.type === type);
}

export async function deleteAccounts(password: string, accountUuids: string[]) {
  password = toProtectedString(password);

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

export async function isWalletHasSeedPhrase() {
  const type = MessageType.HasSeedPhrase;

  const res = await porter.request({ type });
  assert(res?.type === type);

  return res.seedPhraseExists;
}

export async function addSeedPhrase(seedPhrase: SeedPharse) {
  const type = MessageType.AddSeedPhrase;

  const res = await porter.request({
    type,
    seedPhrase,
  });
  assert(res?.type === type);
}

export async function getSeedPhrase(password: string) {
  password = toProtectedString(password);

  const type = MessageType.GetSeedPhrase;

  const res = await porter.request({
    type,
    password,
  });
  assert(res?.type === type);

  return res.seedPhrase;
}

export async function getPrivateKey(password: string, accountUuid: string) {
  password = toProtectedString(password);

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

export function sync(chainId: number, accountAddress: string) {
  const msg: Sync = { type: MessageType.Sync, chainId, accountAddress };

  porter.sendOneWayMessage(msg);
}

export function findToken(
  chainId: number,
  accountAddress: string,
  tokenSlug: string
) {
  const msg: FindToken = {
    type: MessageType.FindToken,
    chainId,
    accountAddress,
    tokenSlug,
  };

  porter.sendOneWayMessage(msg);
}
