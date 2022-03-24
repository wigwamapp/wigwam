type ValidationType = (value: string) => string | undefined;

export const required = (value: string) =>
  value ? undefined : "Required field";

export const minLength = (min: number) => (value: string) =>
  value && value.length >= min ? undefined : `Minimal length is ${min}`;

export const maxLength = (max: number) => (value: string) =>
  value && value.length <= max ? undefined : `Maximal length is ${max}`;

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
