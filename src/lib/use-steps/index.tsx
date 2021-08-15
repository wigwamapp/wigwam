import {
  FC,
  createContext,
  useMemo,
  useContext,
  useRef,
  useCallback,
  ReactNode,
  useLayoutEffect,
} from "react";
import { useAtom } from "jotai";
import { getLastAction, HistoryAction } from "lib/history";
import { atomWithURLHash } from "lib/atom-utils";

export type AllSteps<T = string> = [T, () => ReactNode][];

export type StepsContext = {
  fallbackStep: string;
  stateRef: React.MutableRefObject<Record<string, any>>;
  navigateToStep: (stepId: string) => void;
};

export const stepsContext = createContext<StepsContext | null>(null);

export type StepsProviderProps = {
  namespace: string;
  steps: AllSteps;
  fallback: string;
  rootElement?: HTMLElement;
  children?: (props: { children: ReactNode; step: string }) => ReactNode;
};

export const StepsProvider: FC<StepsProviderProps> = ({
  namespace,
  steps,
  fallback,
  rootElement = window,
  children,
}) => {
  const stepsAtom = useMemo(
    () => atomWithURLHash(`${namespace}_step`, fallback),
    [namespace, fallback]
  );

  const [step, setStep] = useAtom(stepsAtom);

  // Scroll to top after new step pushed.
  const lastHistoryAction = getLastAction();
  useLayoutEffect(() => {
    if (lastHistoryAction === HistoryAction.Push) {
      rootElement.scrollTo(0, 0);
    }
  }, [rootElement, step, lastHistoryAction]);

  const stepsObj = useMemo(() => Object.fromEntries(steps), [steps]);
  const stepNode = useMemo(() => {
    const node = stepsObj[step]();
    return children ? children({ children: node, step }) : node;
  }, [stepsObj, step, children]);

  const stateRef = useRef<Record<string, any>>({});

  const navigateToStep = useCallback(
    (toSet: string, replace = false) => {
      setStep([toSet, replace && "replace"]);
    },
    [setStep]
  );

  const value = useMemo(
    () => ({
      fallbackStep: fallback,
      stateRef,
      navigateToStep,
    }),
    [fallback, navigateToStep]
  );

  return (
    <stepsContext.Provider value={value}>{stepNode}</stepsContext.Provider>
  );
};

export function useSteps() {
  const ctx = useContext(stepsContext);
  if (!ctx) throw new Error("Wrap steps with <StepsProvider />");
  return ctx;
}
