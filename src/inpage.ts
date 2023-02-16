import { InpageProvider } from "core/inpage/provider";
import { UniversalInpageProvider } from "core/inpage/universalProvider";

const vigvam = new InpageProvider();

inject("ethereum", true);
inject("vigvamEthereum");

function inject(key: string, sharedProperty = false) {
  const existing = (window as any)[key];

  if (existing?.isVigvam && "addProviders" in existing) {
    existing.addProviders(vigvam);
    return;
  }

  const propertyDescriptor = Object.getOwnPropertyDescriptor(window, key);
  const redefineProperty =
    !propertyDescriptor || propertyDescriptor.configurable;
  const propIsMetaMaskPreferred = sharedProperty && redefineProperty;

  const universal = new UniversalInpageProvider(
    existing && redefineProperty
      ? [
          vigvam,
          ...(Array.isArray(existing.providers)
            ? new Set([existing, ...existing.providers])
            : [existing]),
        ]
      : [vigvam],
    sharedProperty,
    propIsMetaMaskPreferred
  );

  if (redefineProperty) {
    Object.defineProperty(window, key, {
      configurable: false,
      get() {
        return universal;
      },
      set(value) {
        if (value) universal.addProviders(value);
      },
    });
  } else {
    try {
      (window as any)[key] = universal;
    } catch (err) {
      console.warn(err);
    }
  }

  if (!existing) {
    window.dispatchEvent(new Event(`${key}#initialized`));
  }
}
