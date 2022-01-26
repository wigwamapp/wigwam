import { t } from "lib/ext/i18n";

import { Account, AddAccountParams, AccountSource } from "core/types";
import { fromProtectedString } from "lib/crypto-utils";

import { PublicError } from "./base";
import {
  validateDerivationPath,
  validatePrivateKey,
  validatePublicKey,
} from "./wallet";

export function validateAddAccountParams(params: AddAccountParams) {
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
  }
}

export function validateNoAccountDuplicates(accounts: Account[]) {
  const uniques = new Set<string>();

  for (const { address } of accounts) {
    if (!uniques.has(address)) {
      uniques.add(address);
    } else {
      throw new PublicError(t("walletAlreadyExists"));
    }
  }
}
