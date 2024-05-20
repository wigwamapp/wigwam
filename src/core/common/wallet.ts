import { ethers } from "ethers";
import { t } from "lib/ext/i18n";
import { assert } from "lib/system/assert";
import { fromProtectedString } from "lib/crypto-utils";

import { SeedPharse } from "core/types";

import { PublicError } from "./base";

export const derivationPathRegex = new RegExp("^m(\\/[0-9]+'?)+$");

export function generatePreviewHDNodes(
  extendedKey: string,
  offset = 0,
  limit = 9,
) {
  const root = ethers.HDNodeWallet.fromExtendedKey(extendedKey);

  const nodes: (ethers.HDNodeWallet | ethers.HDNodeVoidWallet)[] = [];
  for (let i = offset; i < offset + limit; i++) {
    nodes.push(root.deriveChild(i));
  }

  return nodes;
}

export function toNeuterExtendedKey(
  hdNode: ethers.HDNodeWallet,
  derivationPath?: string,
) {
  if (derivationPath) {
    hdNode = hdNode.derivePath(derivationPath);
  }

  return hdNode.neuter().extendedKey;
}

export function getSeedPhraseHDNode({ phrase, lang }: SeedPharse) {
  return ethers.HDNodeWallet.fromPhrase(
    fromProtectedString(phrase),
    undefined,
    "m",
    ethers.wordlists[lang],
  );
}

export function validateSeedPhrase({ phrase, lang }: SeedPharse) {
  assert(
    lang in ethers.wordlists,
    t("seedPhraseLanguageNotSupported"),
    PublicError,
  );

  try {
    assert(
      ethers.Mnemonic.isValidMnemonic(
        fromProtectedString(phrase),
        ethers.wordlists[lang],
      ),
    );
  } catch {
    throw new PublicError(t("seedPhraseIsNotValid"));
  }
}

export function validateDerivationPath(path: string) {
  if (!derivationPathRegex.test(path)) {
    throw new PublicError(t("invalidDerivationPath"));
  }
}

export function validatePrivateKey(privKey: string) {
  try {
    privKey = add0x(privKey);
    assert(ethers.isHexString(privKey, 32));
  } catch {
    throw new PublicError(t("invalidPrivateKey"));
  }
}

export function validatePublicKey(pubKey: string) {
  try {
    pubKey = add0x(pubKey);
    assert(ethers.isHexString(pubKey, 33) || ethers.isHexString(pubKey, 65));
  } catch {
    throw new PublicError(t("invalidPublicKey"));
  }
}

export function validateAddress(value: string) {
  try {
    assert(ethers.isAddress(value));
  } catch {
    throw new PublicError(t("invalidAddress"));
  }
}

export function add0x(value: string) {
  return /^[0-9a-f]*$/i.test(value) ? `0x${value}` : value;
}
