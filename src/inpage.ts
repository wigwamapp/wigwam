export {};

const providers: any[] = [];
if ("ethereum" in window) {
  providers.push((window as any).ethereum);
}

Object.defineProperty(window, "ethereum", {
  configurable: true,
  get() {
    return providers[0];
  },
  set(value) {
    providers.push(value);
  },
});
