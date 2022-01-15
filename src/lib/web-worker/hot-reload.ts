export function notifyWorkerSpawned(worker?: Worker) {
  // A little hack for dev experience :)
  // Push custom event "worker_spawned" for hot-reload.
  if (process.env.NODE_ENV === "development") {
    const type = "worker_spawned";

    if (typeof document === "undefined") {
      // Inside worker
      postMessage({ type, scriptPathname: location.pathname });
    } else {
      // Inside parent script
      worker!.addEventListener(
        "message",
        (evt) => {
          if (evt.data?.type === type) {
            window.dispatchEvent(
              new CustomEvent<string>(type, { detail: evt.data.scriptPathname })
            );
          }
        },
        { once: true }
      );
    }
  }
}
