import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";

type ValidationType = (value: string) => string | undefined;

export const required = (value: string) =>
  value ? undefined : "Required field";

export const minLength = (min: number) => (value: string) =>
  value && value.length >= min ? undefined : `Minimum length is ${min}`;

export const maxLength = (max: number) => (value: string) =>
  value && value.length <= max ? undefined : `Maximum length is ${max}`;

export const composeValidators =
  (...validators: ValidationType[]) =>
  (value: string) =>
    validators.reduce(
      (error: string | undefined, validator: ValidationType) =>
        error || validator(value),
      undefined
    );

export const differentPasswords = (password1: string) => (password2: string) =>
  password2 && password1 && password2 !== password1
    ? "Provided password doesn't match"
    : undefined;

export const minValue =
  (min: number, currencySymbol?: string) => (value: string) => {
    const sum = Number(value);
    if (!isNaN(sum) && sum >= min) {
      return undefined;
    } else {
      return `Minimum amount is ${min} ${currencySymbol}`;
    }
  };

export const validateSeedPhrase = (lang: string) => (phrase: string) => {
  if (!(lang in wordlists)) {
    return "Seed phrase language not supported";
  }

  return ethers.utils.isValidMnemonic(phrase, wordlists[lang])
    ? undefined
    : "Seed phrase in not valid";
};

export const differentSeedPhrase = (phrase1: string) => (phrase2: string) =>
  phrase1 && phrase2 && phrase1 !== phrase2
    ? "Provided seed phrase doesn't match with created one"
    : undefined;

const linkRegexExpression =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
const linkRegex = new RegExp(linkRegexExpression);

export const isLink = (value: string) =>
  value?.match(linkRegex) ? undefined : "Please insert a valid link";
