import { FC, useEffect, useRef } from "react";
import { useField } from "react-final-form";
import createDecorator from "final-form-focus";

export const focusOnErrors = createDecorator() as any;

export type OnChangeProps = {
  name: string;
  callback: (value: string) => void;
};

export const OnChange: FC<OnChangeProps> = ({ name, callback }) => {
  const field = useField(name, {
    subscription: { value: true },
    allowNull: true,
  });
  const { value } = field.input;

  const loadedRef = useRef(false);
  const callbackRef = useRef(callback);

  if (callbackRef.current !== callback) {
    callbackRef.current = callback;
  }

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      return;
    }

    callbackRef.current(value);
  }, [value]);

  return null;
};
