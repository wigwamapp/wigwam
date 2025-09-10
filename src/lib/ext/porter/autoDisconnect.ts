import { PorterClient } from "./client";

export function autoDisconnectPort(
  porter: PorterClient,
  delay = 10 * 60 * 1000,
) {
  let idleTimer: ReturnType<typeof setTimeout>;

  const startIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => porter.disconnect(), delay);
  };

  window.addEventListener("blur", startIdleTimer);

  window.addEventListener("focus", () => {
    clearTimeout(idleTimer);

    // If you already cleaned up, you can reload:
    if (!porter) {
      location.reload(); // start from scratch
    }
  });
}
