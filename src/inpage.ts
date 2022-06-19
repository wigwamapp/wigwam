import { InpageProvider } from "core/inpage/provider";
import { UniversalInpageProvider } from "core/inpage/universalProvider";

const vigvam = new InpageProvider();

inject("ethereum");
inject("vigvamEthereum");

function inject(key: string) {
  const existing: InpageProvider = (window as any)[key];

  if (existing?.isVigvam && "addProviders" in existing) {
    (existing as any).addProviders(vigvam);
    return;
  }

  const universal = new UniversalInpageProvider(
    existing ? [vigvam, existing] : [vigvam]
  );

  const propertyDescriptor = Object.getOwnPropertyDescriptor(window, key);
  if (propertyDescriptor && "set" in propertyDescriptor) {
    (window as any)[key] = universal;
  } else {
    Object.defineProperty(window, key, {
      configurable: true,
      get() {
        return universal;
      },
      set(value) {
        if (value) universal.addProviders(value);
      },
    });
  }

  if (!existing) {
    window.dispatchEvent(new Event(`${key}#initialized`));
  }
}
