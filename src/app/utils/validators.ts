import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import BigNumber from "bignumber.js";

type ValidationType = (value: string) => string | undefined;

export const required = (value: string) => (value ? undefined : "Required");

export const minLength = (min: number) => (value: string | number) =>
  value && value.toString().length >= min
    ? undefined
    : `Minimum length is ${min}`;

export const maxLength = (max: number) => (value: string | number) =>
  value && value.toString().length <= max
    ? undefined
    : `Maximum length is ${max}`;

export const composeValidators =
  (...validators: (ValidationType | undefined)[]) =>
  (value: string) =>
    validators.reduce(
      (error: string | undefined, validator?: ValidationType) =>
        error || validator?.(value),
      undefined
    );

export const differentPasswords = (password1: string) => (password2: string) =>
  password2 && password1 && password2 !== password1
    ? "Provided passwords don't match"
    : undefined;

export const maxValue =
  (max: BigNumber.Value, currencySymbol?: string) => (value: string) => {
    const amount = new BigNumber(value);
    if (amount && amount.lte(max)) {
      return undefined;
    }

    return `Maximum amount is ${max} ${currencySymbol}`;
  };

export const validateSeedPhrase = (lang: string) => (phrase: string) => {
  if (!(lang in wordlists)) {
    return "Secret phrase language not supported";
  }

  return ethers.utils.isValidMnemonic(phrase, wordlists[lang])
    ? undefined
    : "Invalid phrase";
};

export const differentSeedPhrase = (phrase1: string) => (phrase2: string) =>
  phrase1 && phrase2 && phrase1 !== phrase2
    ? "Provided secret phrase doesn't match with created one"
    : undefined;

const linkRegexExpression =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
const linkRegex = new RegExp(linkRegexExpression);

export const isLink = (value: string) =>
  !value || value.match(linkRegex) ? undefined : "Link is invalid";

export const validateAddress = (value: string) =>
  ethers.utils.isAddress(value) ? undefined : "Recipient address is invalid";

export const derivationPathRegex = new RegExp("^m(\\/[0-9]+'?)+\\/{index}$");

export const validateDerivationPath = (value: string) =>
  !value || value.match(derivationPathRegex)
    ? undefined
    : "Derivation path is invalid";

export const currencySymbolRegex = new RegExp(
  "^(?=.*[a-zA-Z\\d].*)[a-zA-Z\\d!@#$%&*]+$"
);

export const validateCurrencySymbol = (value: string) =>
  !value || value.match(currencySymbolRegex)
    ? undefined
    : "Currency symbol is invalid";
