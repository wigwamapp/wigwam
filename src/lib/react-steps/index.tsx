import {
  FC,
  createContext,
  useMemo,
  useContext,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { useSearchParams } from "lib/use-search-params";

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
  children?: (props: { children: ReactNode; stepId: string }) => ReactNode;
};

export const StepsProvider: FC<StepsProviderProps> = ({
  namespace,
  steps,
  fallback,
  children,
}) => {
  const stepsObj = useMemo(() => Object.fromEntries(steps), [steps]);
  const key = useMemo(() => `${namespace}_step`, [namespace]);
  const [stepValues, setStepValues] = useSearchParams<string>(key);
  const stepId = 0 in stepValues ? stepValues[0] : fallback;
  const stepNode = useMemo(() => {
    const node = stepsObj[stepId]();
    return children ? children({ children: node, stepId }) : node;
  }, [stepsObj, stepId, children]);

  const stateRef = useRef<Record<string, any>>({});

  const navigateToStep = useCallback(
    (stepId: string) => {
      setStepValues([stepId]);
    },
    [setStepValues]
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
