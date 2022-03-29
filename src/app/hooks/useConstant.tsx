import { useRef } from "react";
import { FormApi } from "final-form";

type FormValues = Record<string, any>;
const useConstant = (init: () => FormApi<FormValues, Partial<FormValues>>) => {
  const initiated = useRef(false);
  const ref = useRef<FormApi<FormValues, Partial<FormValues>> | null>(null);

  if (!initiated.current) {
    initiated.current = true;
    ref.current = init();
  }

  return ref.current;
};

export default useConstant;
