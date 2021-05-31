import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { match } from "ts-pattern";

import { t } from "lib/ext/i18n";
import { assert } from "lib/system/assert";
import * as Repo from "core/repo";

import { SeedPharse, AddAccountParams, AccountType } from "./types";

export class PublicError extends Error {
  name = "PublicError";
}

export async function withError<T>(
  errMessage: string,
  factory: (doThrow: () => void) => Promise<T>
) {
  try {
    return await factory(() => {
      throw new Error("<stub>");
    });
  } catch (err) {
    throw err instanceof PublicError ? err : new PublicError(errMessage);
  }
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

export function validateSeedPhrase({ phrase, lang }: SeedPharse) {
  assert(lang in wordlists, t("seedPhraseLanguageNotSupported"), PublicError);
  assert(
    ethers.utils.isValidMnemonic(phrase, wordlists[lang]),
    t("seedPhraseIsNotValid"),
    PublicError
  );
}

export function validateDerivationPath(path: string) {
  const valid = (() => {
    if (!path.startsWith("m")) {
      return false;
    }
    if (path.length > 1 && path[1] !== "/") {
      return false;
    }

    const parts = path.replace("m", "").split("/").filter(Boolean);
    if (
      !parts.every((path) => {
        const pNum = +(path.includes("'") ? path.replace("'", "") : path);
        return Number.isSafeInteger(pNum) && pNum >= 0;
      })
    ) {
      return false;
    }

    return true;
  })();

  if (!valid) {
    throw new PublicError(t("derivationPathIsInvalid"));
  }
}

export function validatePrivateKey(privKey: string) {
  try {
    new ethers.Wallet(privKey);
  } catch {
    throw new PublicError(t("invalidPrivateKey"));
  }
}

export function validatePublicKey(pubKey: string) {
  try {
    ethers.utils.computeAddress(pubKey);
  } catch {
    throw new PublicError(t("invalidPublicKey"));
  }
}
