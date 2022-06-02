import { InpageProvider } from "core/inpage/provider";
// import { RequestArguments } from "core/types/rpc";

const provider = new InpageProvider();

inject("ethereum", provider);
inject("vigvamEthereum", provider);

function inject(key: string, provider: InpageProvider) {
  const providers = [provider];

  const existingProvider: InpageProvider = (window as any)[key];

  if (existingProvider) {
    providers.push(existingProvider);
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

  if (!existingProvider) {
    window.dispatchEvent(new Event(`${key}#initialized`));
  }
}

// if (key in window) {
//   const existingProvider = (window as any)[key];
//   if (Array.isArray(currentProvider?.providers)) {
//     currentProvider.providers.push(provider);
//     return;
//   }
// }

// if (key in window) {
//   providers.push((window as any)[key]);
// }

// class UniversalProvider extends InpageProvider {
//   providers: InpageProvider[] = [];
//   selectedProvider: InpageProvider | null = null;

//   constructor(existingProvider?: InpageProvider) {
//     super();
//   }

//   request(args: RequestArguments): Promise<unknown> {
//     if (args.method === "wallet_requestPermissions") {
//     }

//     return super.request(args);
//   }

//   #addProvider(newProvider: InpageProvider) {
//     this.providers.push(newProvider);
//     this.#reshufle();
//   }
// }
