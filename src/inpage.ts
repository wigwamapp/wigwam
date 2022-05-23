import { InpageProvider } from "core/inpage/provider";

const provider = new InpageProvider();

inject("ethereum", provider);
inject("vigvamEthereum", provider);

function inject(key: string, provider: InpageProvider) {
  const providers = [provider];

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

// class UniversalProvider extends InpageProvider {
//   isVigvam = false;

//   providers: InpageProvider[] = [];
//   selectedProvider: InpageProvider | null = null;

//   request(args: RequestArguments): Promise<unknown> {
//     if (args.method === "wallet_requestPermissions") {
//     }

//     return super.request(args);
//   }
// }
