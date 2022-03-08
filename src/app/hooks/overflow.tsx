import {
  FC,
  createContext,
  useRef,
  RefObject,
  useContext,
  ReactNode,
} from "react";

type OverflowContextValue = RefObject<HTMLElement> | null;

const OverflowContext = createContext<OverflowContextValue>(null);

export const useOverflowRef = () => {
  const ctx = useContext(OverflowContext);

  return ctx ?? undefined;
};

type OverflowProviderProps = {
  children: (ref: RefObject<any>) => ReactNode;
};

export const OverflowProvider: FC<OverflowProviderProps> = ({ children }) => {
  const overflowElementRef = useRef<HTMLElement>(null);

  return (
    <OverflowContext.Provider value={overflowElementRef}>
      {children(overflowElementRef)}
    </OverflowContext.Provider>
  );
};
