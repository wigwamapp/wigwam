export enum HistoryAction {
  Pop = "popstate",
  Push = "pushstate",
  Replace = "replacestate",
}

export const listen = init();

export function changeState(url: string, replace = false, state: any = null) {
  const title = ""; // Deprecated stuff
  const method = replace ? "replaceState" : "pushState";
  window.history[method](state, title, url);
}

export function go(delta: number) {
  window.history.go(delta);
}

export function goBack() {
  go(-1);
}

export function goForward() {
  go(1);
}

export function getLastAction(): HistoryAction | undefined {
  return sessionStorage.lastAction;
}

export function getPosition() {
  return +sessionStorage.historyPosition || 0;
}

export function resetPosition() {
  sessionStorage.historyPosition = "0";
}

function init() {
  // Patch default history methods to listen
  patchMethod("pushState", HistoryAction.Push);
  patchMethod("replaceState", HistoryAction.Replace);

  // Listen history changes
  type Listener = (action: HistoryAction) => void;
  const listeners = new Set<Listener>();

  for (const action of Object.values(HistoryAction)) {
    window.addEventListener(action, () => {
      for (const callback of listeners) {
        try {
          callback(action);
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  const listen = (callback: Listener): (() => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };

  // Persist last action & position
  listen(persist);

  return listen;
}

function persist(action: HistoryAction) {
  const position = Math.max(
    0,
    getPosition() +
      (action === HistoryAction.Push
        ? 1
        : action === HistoryAction.Pop
          ? -1
          : 0),
  );

  Object.assign(sessionStorage, {
    lastAction: action,
    historyPosition: position,
  });
}

function patchMethod(method: string, eventType: HistoryAction) {
  const history = window.history as any;
  const original = history[method];

  history[method] = function (state: any) {
    // eslint-disable-next-line
    const result = original.apply(this, arguments);

    const event = new CustomEvent(eventType);
    (event as any).state = state;
    window.dispatchEvent(event);

    return result;
  };
}
