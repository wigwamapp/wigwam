const DEFAULT_TIMEOUT = 10 * 60_000; // 10 minutes

export function sleepOnInactivity(options: {
  onSleep: () => void;
  onWake: () => void;
  timeout?: number;
}) {
  const { onSleep, onWake, timeout = DEFAULT_TIMEOUT } = options;

  let sleepTimer: ReturnType<typeof setTimeout> | null = null;
  let sleeping = false;

  function clearTimer() {
    if (sleepTimer) {
      clearTimeout(sleepTimer);
      sleepTimer = null;
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      clearTimer();
      sleepTimer = setTimeout(() => {
        if (sleeping) return;
        sleeping = true;
        onSleep();
      }, timeout);
    } else {
      clearTimer();

      if (sleeping) {
        sleeping = false;
        onWake();
      }
    }
  }

  document.addEventListener("visibilitychange", handleVisibilityChange);
}
