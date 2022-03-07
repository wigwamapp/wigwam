import { FC, createContext, useContext } from "react";
import Tippy, { useSingleton } from "@tippyjs/react";

type SingletonTarget = ReturnType<typeof useSingleton>["1"];

const TippySingletonTargetContext = createContext<SingletonTarget | null>(null);

export const TippySingletonProvider: FC = ({ children }) => {
  const [source, target] = useSingleton({
    overrides: ["placement", "trigger", "popperOptions"],
  });

  return (
    <>
      <Tippy singleton={source} />

      <TippySingletonTargetContext.Provider value={target}>
        {children}
      </TippySingletonTargetContext.Provider>
    </>
  );
};

export function useTippySingletonTarget() {
  const target = useContext(TippySingletonTargetContext);

  return target ?? undefined;
}
