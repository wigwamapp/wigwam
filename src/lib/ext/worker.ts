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
      const handleMessage = (evt: MessageEvent<any>) => {
        if (evt.data?.type === "worker_spawned") {
          window.dispatchEvent(
            new CustomEvent<string>(evt.data.type, {
              detail: evt.data.scriptPathname,
            })
          );
          worker!.removeEventListener("message", handleMessage);
        }
      };

      worker!.addEventListener("message", handleMessage);
    }
  }
}
