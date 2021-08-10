import { atom, Atom, Getter } from "jotai";
import { liveQuery, PromiseExtended } from "dexie";

type Subscription = {
  unsubscribe: () => void;
};

export function atomWithRepoQuery<TData>(
  createQuery: (get: Getter) => PromiseExtended<TData>
): Atom<TData> {
  const observableResultAtom = atom((get) => {
    let settlePromise: ((data: TData | null, err?: unknown) => void) | null =
      null;

    const observable = liveQuery(() => createQuery(get));

    const dataAtom = atom<TData | Promise<TData>>(
      new Promise<TData>((resolve, reject) => {
        settlePromise = (data, err) => {
          if (err) {
            reject(err);
          } else {
            resolve(data as TData);
          }
        };
      })
    );

    let setData: (data: TData | Promise<TData>) => void = () => {
      throw new Error("setting data without mount");
    };

    const dataListener = (data: TData) => {
      if (settlePromise) {
        settlePromise(data);
        settlePromise = null;
        if (subscription && !setData) {
          subscription.unsubscribe();
          subscription = null;
        }
      } else {
        setData(data);
      }
    };

    const errorListener = (error: unknown) => {
      if (settlePromise) {
        settlePromise(null, error);
        settlePromise = null;
        if (subscription && !setData) {
          subscription.unsubscribe();
          subscription = null;
        }
      } else {
        setData(Promise.reject<TData>(error));
      }
    };

    let subscription: Subscription | null = observable.subscribe(
      dataListener,
      errorListener
    );
    if (!settlePromise) {
      subscription.unsubscribe();
      subscription = null;
    }

    dataAtom.onMount = (update) => {
      setData = update;
      if (!subscription) {
        subscription = observable.subscribe(dataListener, errorListener);
      }

      return () => {
        subscription?.unsubscribe();
        subscription = null;
      };
    };

    return { dataAtom, observable };
  });

  const observableAtom = atom((get) => {
    const { dataAtom } = get(observableResultAtom);
    return get(dataAtom);
  });

  return observableAtom;
}
