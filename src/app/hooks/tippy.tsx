import { FC, PropsWithChildren, createContext, useContext } from "react";
import Tippy, { useSingleton, UseSingletonProps } from "@tippyjs/react";

type SingletonTarget = ReturnType<typeof useSingleton>["1"];

const TippySingletonTargetContext = createContext<SingletonTarget | null>(null);

const singletonParams: UseSingletonProps = {
  overrides: [
    "placement",
    "trigger",
    "popperOptions",
    "appendTo",
    "hideOnClick",
    "offset",
    "maxWidth",
    "interactive",
    "delay",
    "duration",
  ],
};

export const TippySingletonProvider: FC<PropsWithChildren> = ({ children }) => {
  const [source, target] = useSingleton(singletonParams);

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
