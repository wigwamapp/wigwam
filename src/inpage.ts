import { InpageProtocol } from "core/inpage/protocol";
import { InpageProvider } from "core/inpage/provider";
import { UniversalInpageProvider } from "core/inpage/universalProvider";
import {
  JSONRPC,
  WIGWAM_PHISHING_WARNING,
  WIGWAM_STATE,
} from "core/common/rpc";
import { MetaMaskCompatibleMode } from "core/types/shared";

const inpageProto = new InpageProtocol("injected", "content");
const wigwam = new InpageProvider(inpageProto);

const isMetaMaskModeEnabled = new Promise<boolean>((res) => {
  const unsub = inpageProto.subscribe((payload) => {
    if (payload?.jsonrpc === JSONRPC && payload?.method === WIGWAM_STATE) {
      const metamaskModeEnabled =
        payload.params.mmCompatible !== MetaMaskCompatibleMode.Off;

      res(metamaskModeEnabled);
      unsub();
    }
  });

  // Fallback
  setTimeout(() => {
    res(false);
    unsub();
  }, 3_000);
});

injectEIP1193("ethereum", true);
injectEIP1193("wigwamEthereum");
injectEIP5749("evmproviders");
injectEIP6963();

warnIfPhishing();

// https://eips.ethereum.org/EIPS/eip-1193
function injectEIP1193(key: string, sharedProperty = false) {
  const getExisting = () => (window as any)[key];

  let existing = getExisting();

  if (existing?.isWigwam && "addProviders" in existing) {
    existing.addProviders(wigwam);
    return;
  }

  const propertyDescriptor = Object.getOwnPropertyDescriptor(window, key);
  const redefineProperty =
    !propertyDescriptor || propertyDescriptor.configurable;
  const propIsMetaMaskPreferred = sharedProperty && redefineProperty;

  const getUniversal = () => {
    existing = getExisting();

    return new UniversalInpageProvider(
      existing && redefineProperty
        ? [wigwam, ...getProvidersInline(existing)]
        : [wigwam],
      sharedProperty,
      propIsMetaMaskPreferred,
    );
  };

  const defineProperty = () => {
    const universal = getUniversal();

    Object.defineProperty(window, key, {
      configurable: false,
      get() {
        return universal;
      },
      set(value) {
        if (value) universal.addProviders(value);
      },
    });

    if (!existing) {
      window.dispatchEvent(new Event(`${key}#initialized`));
    }
  };

  if (redefineProperty) {
    if (sharedProperty) {
      isMetaMaskModeEnabled.then((enabled) => {
        if (enabled) defineProperty();
      });
    } else {
      defineProperty();
    }
  } else {
    try {
      (window as any)[key] = getUniversal();
    } catch (err) {
      console.warn(err);
    }
  }
}

// https://eips.ethereum.org/EIPS/eip-5749
function injectEIP5749(key: string) {
  const evmProviders: Record<string, InpageProvider> =
    (window as any)[key] || ((window as any)[key] = {});

  evmProviders[wigwam.info.uuid] = wigwam;
}

// https://eips.ethereum.org/EIPS/eip-6963
function injectEIP6963() {
  const announceProvider = () => {
    window.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", {
        detail: Object.freeze({ info: wigwam.info, provider: wigwam }),
      }),
    );
  };

  window.addEventListener("eip6963:requestProvider", announceProvider);

  announceProvider();
}

function getProvidersInline(existing: any) {
  try {
    if (Array.isArray(existing.providers)) {
      return new Set([existing, ...existing.providers]);
    }
  } catch (err) {
    console.warn(err);
  }

  return [existing];
}

function warnIfPhishing() {
  const unsub = inpageProto.subscribe((payload) => {
    if (
      payload?.jsonrpc === JSONRPC &&
      payload?.method === WIGWAM_PHISHING_WARNING
    ) {
      unsub();

      // TODO: Add own warning page
      setTimeout(() => {
        location.replace(
          `https://metamask.github.io/phishing-warning/v2.1.0/#hostname=${location.hostname}&href=${location.href}`,
        );
      }, 50);
    }
  });
}
