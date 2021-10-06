import { assert } from "lib/system/assert";
import {
  EventMessage,
  MessageType,
  WalletStatus,
  AddAccountParams,
  SeedPharse,
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

export async function setupWallet(
  password: string,
  accounts: AddAccountParams[],
  seedPhrase?: SeedPharse
) {
  const type = MessageType.SetupWallet;
  const res = await porter.request({
    type,
    password,
    accounts,
    seedPhrase,
  });
  assert(res?.type === type);
  return res.accountAddresses;
}

export async function unlockWallet(password: string) {
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

export async function addAccounts(accounts: AddAccountParams[]) {
  const type = MessageType.AddAccounts;
  const res = await porter.request({
    type,
    accounts,
  });
  assert(res?.type === type);
  return res.accountAddresses;
}

export async function deleteAccount(
  password: string,
  accountAddresses: string[]
) {
  const type = MessageType.DeleteAccounts;
  const res = await porter.request({
    type,
    password,
    accountAddresses,
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
  const res = await porter.request({
    type,
    password,
  });
  assert(res?.type === type);
  return res.seedPhrase;
}

export async function getPrivateKey(password: string, accountAddress: string) {
  const type = MessageType.GetPrivateKey;
  const res = await porter.request({
    type,
    password,
    accountAddress,
  });
  assert(res?.type === type);
  return res.privateKey;
}

export async function getPublicKey(accountAddress: string) {
  const type = MessageType.GetPublicKey;
  const res = await porter.request({
    type,
    accountAddress,
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
