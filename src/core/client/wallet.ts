import { assert } from "lib/system/assert";
import { getPasswordHash } from "lib/crypto-utils/hash";
import {
  EventMessage,
  MessageType,
  WalletStatus,
  AddAccountParams,
  SeedPharse,
  Account,
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
  return porter.onMessage<EventMessage>((msg) => {
    if (msg.type === MessageType.WalletStatusUpdated) {
      callback(msg.status);
    }
  });
}

export function onAccountsUpdated(callback: (newAccounts: Account[]) => void) {
  return porter.onMessage<EventMessage>((msg) => {
    if (msg.type === MessageType.AccountsUpdated) {
      callback(msg.accounts);
    }
  });
}

export async function setupWallet(
  password: string,
  accountsParams: AddAccountParams[],
  seedPhrase?: SeedPharse
) {
  const type = MessageType.SetupWallet;
  const passwordHash = getPasswordHash(password);

  const res = await porter.request({
    type,
    passwordHash,
    accountsParams,
    seedPhrase,
  });
  assert(res?.type === type);
}

export async function unlockWallet(password: string) {
  const type = MessageType.UnlockWallet;
  const passwordHash = getPasswordHash(password);

  const res = await porter.request({
    type,
    passwordHash,
  });
  assert(res?.type === type);
}

export async function lockWallet() {
  const type = MessageType.LockWallet;

  const res = await porter.request({ type });
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
  const type = MessageType.DeleteAccounts;
  const passwordHash = getPasswordHash(password);

  const res = await porter.request({
    type,
    passwordHash,
    accountUuids,
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
  const type = MessageType.GetSeedPhrase;
  const passwordHash = getPasswordHash(password);

  const res = await porter.request({
    type,
    passwordHash,
  });
  assert(res?.type === type);

  return res.seedPhrase;
}

export async function getPrivateKey(password: string, accountUuid: string) {
  const type = MessageType.GetPrivateKey;
  const passwordHash = getPasswordHash(password);

  const res = await porter.request({
    type,
    passwordHash,
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

  const res = await porter.request({
    type,
    derivationPath,
  });
  assert(res?.type === type);

  return res.extendedKey;
}
