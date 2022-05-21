import { InpageProvider } from "core/inpage/provider";

injectUniversal("ethereum");
injectUniversal("vigvamEthereum");

function injectUniversal(key: string) {
  const providers: InpageProvider[] = [new InpageProvider()];

  if (key in window) {
    providers.push((window as any)[key]);
  }

  Object.defineProperty(window, key, {
    configurable: true,
    get() {
      return providers.find((p) => p.selectedAddress) ?? providers[0];
    },
    set(value) {
      providers.push(value);
    },
  });

  window.dispatchEvent(new Event(`${key}#initialized`));
}
