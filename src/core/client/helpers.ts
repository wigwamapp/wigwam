import { match } from "ts-pattern";

import { AccountParams, AddAccountParams, AccountSourceType } from "core/types";

export function toPlainAccountParams(
  addParams: AddAccountParams
): AccountParams {
  return match(addParams)
    .with({ sourceType: AccountSourceType.SeedPhrase }, (p) => ({
      type: p.type,
      sourceType: p.sourceType,
      derivationPath: p.derivationPath,
    }))
    .with({ sourceType: AccountSourceType.PrivateKey }, (p) => ({
      type: p.type,
      sourceType: p.sourceType,
    }))
    .with({ sourceType: AccountSourceType.Ledger }, (p) => ({
      type: p.type,
      sourceType: p.sourceType,
      derivationPath: p.derivationPath,
    }))
    .with({ sourceType: AccountSourceType.Torus }, (p) => ({
      type: p.type,
      sourceType: p.sourceType,
      social: p.social,
    }))
    .with({ sourceType: AccountSourceType.Address }, (p) => ({
      type: p.type,
      sourceType: p.sourceType,
    }))
    .exhaustive();
}
