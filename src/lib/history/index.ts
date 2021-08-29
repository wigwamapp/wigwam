export enum HistoryAction {
  Pop = "popstate",
  Push = "pushstate",
  Replace = "replacestate",
}

export interface PatchedHistory extends History {
  lastAction: HistoryAction;
  position: number;
}

const patchedHistory = window.history as PatchedHistory;

const ACTIONS = Object.values(HistoryAction);

export function listen(listener: (action: HistoryAction) => void) {
  const refs: [HistoryAction, () => void][] = ACTIONS.map((action) => [
    action,
    () => listener(action),
  ]);

  for (const [action, cb] of refs) window.addEventListener(action, cb);
  return () => {
    for (const [action, cb] of refs) window.removeEventListener(action, cb);
  };
}

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

export function getLastAction() {
  return patchedHistory.lastAction;
}

export function getPosition() {
  return patchedHistory.position ?? 0;
}

export function resetPosition() {
  patchedHistory.position = 0;
}

patchMethod("pushState", HistoryAction.Push);
patchMethod("replaceState", HistoryAction.Replace);

listen(patchHistory);

function patchHistory(action: HistoryAction) {
  const position = Math.max(
    0,
    getPosition() +
      (action === HistoryAction.Push
        ? 1
        : action === HistoryAction.Pop
        ? -1
        : 0)
  );

  Object.assign(patchedHistory, {
    lastAction: action,
    position,
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
