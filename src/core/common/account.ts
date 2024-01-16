import { t } from "lib/ext/i18n";

import { Account, AddAccountParams, AccountSource } from "core/types";
import { fromProtectedString } from "lib/crypto-utils";

import { PublicError } from "./base";
import {
  validateDerivationPath,
  validatePrivateKey,
  validatePublicKey,
  validateAddress,
} from "./wallet";

export function validateAddAccountParams(params: AddAccountParams) {
  validateName(params.name);

  switch (params.source) {
    case AccountSource.SeedPhrase:
      validateDerivationPath(params.derivationPath);
      break;

    case AccountSource.Ledger:
      validateDerivationPath(params.derivationPath);
      validatePublicKey(fromProtectedString(params.publicKey));
      break;

    case AccountSource.PrivateKey:
    case AccountSource.OpenLogin:
      validatePrivateKey(fromProtectedString(params.privateKey));
      break;

    case AccountSource.Address:
      validateAddress(params.address);
      break;

    default:
      return;
  }
}

export function validateNoAccountDuplicates(accounts: Account[]) {
  const uniques = new Set<string>();

  for (const { uuid, address } of accounts) {
    if (!uniques.has(uuid) && !uniques.has(address)) {
      uniques.add(uuid).add(address);
    } else {
      throw new PublicError(t("walletAlreadyExists"));
    }
  }
}

export function validateName(value: string) {
  if (!value) throw new PublicError(t("invalidName"));
}
