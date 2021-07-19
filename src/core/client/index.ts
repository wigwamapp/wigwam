import { PorterClient } from "lib/ext/porter/client";
import { assert } from "lib/system/assert";
import {
  PorterChannel,
  Request,
  Response,
  EventMessage,
  MessageType,
  WalletStatus,
  AddAccountsParams,
  SeedPharse,
} from "core/types";
import * as Repo from "core/repo";

const porter = new PorterClient<Request, Response>(PorterChannel.Wallet);

export async function createAccounts(addParams: AddAccountsParams) {
  const addresses = await addAccounts(addParams);

  let names: string[];
  if (addParams.names) {
    names = addParams.names;
  } else {
    names = [];
    const count = await Repo.accounts.count();
    for (let i = 0; i < addresses.length; i++) {
      names.push(`{{wallet}} ${count + 1 + i}`);
    }
  }

  // const params: any = match(addParams)
  //   .with({ type: AccountType.HD }, (p) => ({
  //     derivationPath: p.derivationPath,
  //   }))
  //   .otherwise(() => ({}));

  await Repo.accounts.bulkAdd(
    addresses.map((address, i) => ({
      type: addParams.type,
      address,
      name: names[i],
      params: {},
      usdValues: {},
    }))
  );
}

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
  accountsParams: AddAccountsParams,
  seedPhrase?: SeedPharse
) {
  const type = MessageType.SetupWallet;
  const res = await porter.request({
    type,
    password,
    accountsParams,
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

export async function addAccounts(params: AddAccountsParams) {
  const type = MessageType.AddAccounts;
  const res = await porter.request({
    type,
    params,
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
