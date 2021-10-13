import { match } from "ts-pattern";
import { t } from "lib/ext/i18n";

import * as Repo from "core/repo";
import {
  AccountType,
  AccountParams,
  AddAccountParams,
  AccountSource,
} from "core/types";

import { PublicError } from "./base";
import {
  validateDerivationPath,
  validatePrivateKey,
  validatePublicKey,
} from "./wallet";

export function saveAccounts(
  accounts: AddAccountParams[],
  addresses: string[]
) {
  return Repo.accounts.bulkAdd(
    accounts.map((addParams, i) => ({
      ...toPlainAccountParams(addParams),
      address: addresses[i],
      name: addParams.name,
      usdValues: {}, // Record<chainId, usdVolumeSnapshot>
    }))
  );
}

export function cleanAccounts(addresses: string[]) {
  return Repo.accounts.bulkDelete(addresses);
}

export function toPlainAccountParams(
  addParams: AddAccountParams
): AccountParams {
  return match(addParams)
    .with({ source: AccountSource.SeedPhrase }, (p) => ({
      type: p.type,
      source: p.source,
      derivationPath: p.derivationPath,
    }))
    .with({ source: AccountSource.PrivateKey }, (p) => ({
      type: p.type,
      source: p.source,
    }))
    .with({ source: AccountSource.Ledger }, (p) => ({
      type: p.type,
      source: p.source,
      derivationPath: p.derivationPath,
    }))
    .with({ source: AccountSource.OpenLogin }, (p) => ({
      type: p.type,
      source: p.source,
      social: p.social,
    }))
    .with({ source: AccountSource.Address }, (p) => ({
      type: p.type,
      source: p.source,
    }))
    .exhaustive();
}

export async function validateAccountExistence(address: string) {
  const acc = await Repo.accounts.get(address);
  if (acc) {
    throw new PublicError(t("accountAlreadyExists"));
  }
}

export function validateAddAccountParams(params: AddAccountParams) {
  match(params)
    .with({ type: AccountType.HD }, (p) => {
      validateDerivationPath(p.derivationPath);
    })
    .with({ type: AccountType.Imported }, (p) => {
      validatePrivateKey(p.privateKey);
    })
    .with({ type: AccountType.External }, (p) => {
      validatePublicKey(p.publicKey);
    })
    .run();
}
