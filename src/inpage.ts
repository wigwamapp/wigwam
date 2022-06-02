import { InpageProvider } from "core/inpage/provider";
import { UniversalInpageProvider } from "core/inpage/universalProvider";

const vigvam = new InpageProvider();

inject("ethereum");
inject("vigvamEthereum");

function inject(key: string) {
  const existing: InpageProvider = (window as any)[key];
  const universal = new UniversalInpageProvider(
    existing ? [vigvam, existing] : [vigvam]
  );

  Object.defineProperty(window, key, {
    configurable: true,
    get() {
      return universal;
    },
    set(value) {
      universal.addProviders([value]);
    },
  });

  if (!existing) {
    window.dispatchEvent(new Event(`${key}#initialized`));
  }
}
