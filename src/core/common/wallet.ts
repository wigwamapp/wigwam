import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { t } from "lib/ext/i18n";
import { assert } from "lib/system/assert";

import { SeedPharse } from "core/types";

import { PublicError } from "./base";

export const derivationPathRegex = new RegExp("^m(\\/[0-9]+'?)+$");

export function generatePreviewHDNodes(
  extendedKey: string,
  offset = 0,
  limit = 9
) {
  const root = ethers.utils.HDNode.fromExtendedKey(extendedKey);

  const nodes: ethers.utils.HDNode[] = [];
  for (let i = offset; i < offset + limit; i++) {
    nodes.push(root.derivePath(i.toString()));
  }

  return nodes;
}

export function toNeuterExtendedKey(
  seedPhrase: SeedPharse,
  derivationPath: string
) {
  return ethers.utils.HDNode.fromMnemonic(
    seedPhrase.phrase,
    undefined,
    wordlists[seedPhrase.lang]
  )
    .derivePath(derivationPath)
    .neuter().extendedKey;
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
  if (!derivationPathRegex.test(path)) {
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
