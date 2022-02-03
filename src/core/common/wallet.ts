import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { t } from "lib/ext/i18n";
import { assert } from "lib/system/assert";
import { fromProtectedString } from "lib/crypto-utils";

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
  hdNode: ethers.utils.HDNode,
  derivationPath?: string
) {
  if (derivationPath) {
    hdNode = hdNode.derivePath(derivationPath);
  }

  return hdNode.neuter().extendedKey;
}

export function getSeedPhraseHDNode({ phrase, lang }: SeedPharse) {
  return ethers.utils.HDNode.fromMnemonic(
    fromProtectedString(phrase),
    undefined,
    wordlists[lang]
  );
}

export function validateSeedPhrase({ phrase, lang }: SeedPharse) {
  assert(lang in wordlists, t("seedPhraseLanguageNotSupported"), PublicError);
  assert(
    ethers.utils.isValidMnemonic(fromProtectedString(phrase), wordlists[lang]),
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
