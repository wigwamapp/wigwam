type ValidationType = (value: string) => string | undefined;

export const required = (value: string) =>
  value ? undefined : "Required field";

export const isNumber = (value: string) =>
  value && isNaN(Number(value)) ? "Value must be an integer" : undefined;

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

export const minValue =
  (min: number, currencySymbol?: string) => (value: string) => {
    const sum = Number(value);
    if (!isNaN(sum) && sum >= min) {
      return undefined;
    } else {
      return `Minimal sum is ${min} ${currencySymbol}`;
    }
  };

export const exactLength = (length: number) => (seed: string) =>
  seed.split(" ").length === length
    ? undefined
    : `Available amount of words: ${length}`;

export const marked = (value: string) =>
  value === "true" ? undefined : "You have to accept it first";
