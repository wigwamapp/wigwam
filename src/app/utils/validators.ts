import { ethers } from "ethers";
import BigNumber from "bignumber.js";

type ValidationType = (value: string) => string | undefined;

export const required = (value: string) => (value ? undefined : "Required");

export const minLength = (min: number) => (value: string | number) =>
  value && value.toString().length >= min
    ? undefined
    : `The minimum length is ${min}`;

export const maxLength = (max: number) => (value: string | number) =>
  value && value.toString().length <= max
    ? undefined
    : `The maximum length is ${max}`;

export const composeValidators =
  (...validators: (ValidationType | undefined)[]) =>
  (value: string) =>
    validators.reduce(
      (error: string | undefined, validator?: ValidationType) =>
        error || validator?.(value),
      undefined,
    );

export const differentPasswords = (password1: string, password2: string) =>
  password2 && password1 && password2 !== password1
    ? "Provided passwords don't match"
    : undefined;

export const maxValue =
  (max: BigNumber.Value, currencySymbol?: string) => (value: string) => {
    const amount = new BigNumber(value);
    if (amount && amount.lte(max)) {
      return undefined;
    }

    return `The maximum amount is ${max}${
      currencySymbol ? ` ${currencySymbol}` : ""
    }`;
  };

export const validateSeedPhrase = (lang: string) => (phrase: string) => {
  if (!(lang in ethers.wordlists)) {
    return "Secret phrase language not supported";
  }

  return ethers.Mnemonic.isValidMnemonic(phrase, ethers.wordlists[lang])
    ? undefined
    : "Invalid phrase";
};

export const differentSeedPhrase = (phrase1: string) => (phrase2: string) =>
  phrase1 && phrase2 && phrase1 !== phrase2
    ? "Provided secret phrase doesn't match with created one"
    : undefined;

export const isUrlLike = (value: string) =>
  !value || value.includes("://") ? undefined : "URL is invalid";

export const validateAddress = (value: string) =>
  ethers.isAddress(value) ? undefined : "The recipient address is invalid";

export const derivationPathRegex = new RegExp("^m(\\/[0-9]+'?)+\\/{index}$");

export const validateDerivationPath = (value: string) =>
  !value || value.match(derivationPathRegex)
    ? undefined
    : "The derivation path is invalid";

export const currencySymbolRegex = new RegExp(
  "^(?=.*[a-zA-Z\\d].*)[a-zA-Z\\d!@#$%&*]+$",
);

export const validateCurrencySymbol = (value: string) =>
  !value || value.match(currencySymbolRegex)
    ? undefined
    : "The currency symbol is invalid";

const passwordRegex = new RegExp(
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z`!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~]{8,}$/,
);

export const validatePassword = (value: string) =>
  !value || value.match(passwordRegex) ? undefined : "Password is invalid";
