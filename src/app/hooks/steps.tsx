import {
  createContext,
  useMemo,
  useContext,
  useRef,
  useCallback,
  ReactNode,
  useLayoutEffect,
  useEffect,
  MutableRefObject,
  RefObject,
} from "react";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { getLastAction, HistoryAction } from "lib/history";
import { URLHashAtom } from "lib/atom-utils";

export type AllSteps<T> = [T, () => ReactNode][];

export type StepsContext = {
  stateRef: MutableRefObject<Record<string, any>>;
  navigateToStep: (stepId: string) => void;
  reset: () => void;
};

export const stepsContext = createContext<StepsContext | null>(null);

export type StepsProviderProps<T> = {
  atom: URLHashAtom<T>;
  steps: AllSteps<T>;
  resetOnExit?: boolean;
  rootRef?: RefObject<HTMLElement>;
  children?: (props: { children: ReactNode; step: T }) => ReactNode;
};

export const StepsProvider = <T,>({
  atom,
  steps,
  resetOnExit = true,
  rootRef,
  children,
}: StepsProviderProps<T>) => {
  const [step, setStep] = useAtom(atom);

  // Scroll to top after new step pushed.
  const lastHistoryAction = getLastAction();
  useLayoutEffect(() => {
    if (lastHistoryAction === HistoryAction.Push) {
      const element = rootRef ? rootRef.current : window;
      element?.scrollTo(0, 0);
    }
  }, [rootRef, step, lastHistoryAction]);

  const stepsObj = useMemo(() => Object.fromEntries(steps), [steps]);
  const stepNode = useMemo<ReactNode>(() => {
    const node = stepsObj[step]();
    return children ? children({ children: node, step: step as any }) : node;
  }, [stepsObj, step, children]);

  const stateRef = useRef<Record<string, any>>({});

  const navigateToStep = useCallback(
    (toSet: string, replace = false) => {
      setStep(replace ? [toSet as T, "replace"] : [toSet as T]);
    },
    [setStep],
  );

  const reset = useCallback(() => {
    stateRef.current = {};
    setTimeout(() => setStep([RESET, "replace"]));
  }, [setStep]);

  useEffect(() => (resetOnExit ? reset : undefined), [resetOnExit, reset]);

  const value = useMemo<StepsContext>(
    () => ({
      stateRef,
      navigateToStep,
      reset,
    }),
    [navigateToStep, reset],
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
