import { FC, createContext, Ref, useContext, ReactNode, useState } from "react";

type OverflowContextValue = HTMLElement | null;

const OverflowContext = createContext<OverflowContextValue>(null);

export const useOverflowElement = () => useContext(OverflowContext);

type OverflowProviderProps = {
  children: (ref: Ref<any>) => ReactNode;
};

export const OverflowProvider: FC<OverflowProviderProps> = ({ children }) => {
  const [overflowElement, setOverflowElement] = useState<HTMLElement | null>(
    null,
  );

  return (
    <OverflowContext.Provider value={overflowElement}>
      {children(setOverflowElement)}
    </OverflowContext.Provider>
  );
};
