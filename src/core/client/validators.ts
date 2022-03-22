import * as i18n from "lib/ext/i18n";

type ValidationType = (value: string) => string | undefined;

export const required = (value: string) =>
  value ? undefined : i18n.t("common:Validators.required");

export const minLength = (min: number) => (value: string) =>
  value && value.length >= min
    ? undefined
    : `${i18n.t("common:Validators.minLength")}${min}`;

export const maxLength = (max: number) => (value: string) =>
  value && value.length <= max
    ? undefined
    : `${i18n.t("common:Validators.maxLength")}${max}`;

export const composeValidators =
  (...validators: ValidationType[]) =>
  (value: string) =>
    validators.reduce(
      (error: string | undefined, validator: ValidationType) =>
        error || validator(value),
      undefined
    );

export const differentPasswords = (password1: string) => (password2: string) =>
  password2 && password1 && password2 === password1
    ? undefined
    : i18n.t("common:Validators.differentPasswords");
