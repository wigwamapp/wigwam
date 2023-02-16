import { Emitter } from "lib/emitter";

import {
  RequestArguments,
  SendSyncJsonRpcRequest,
  JsonRpcMethod,
} from "core/types/rpc";

import type { InpageProvider } from "./provider";

export class UniversalInpageProvider extends Emitter {
  allProviders: InpageProvider[] = [];
  currentProvider: InpageProvider;

  #sharedProperty: boolean;

  get #enabledProviders() {
    return this.#sharedProperty
      ? this.allProviders.filter((p) => !p.isVigvam || p.sharedPropertyEnabled)
      : this.allProviders;
  }

  get isMetaMask() {
    return (
      this.propIsMetaMaskPreferred &&
      (this.selectedAddress
        ? this.currentProvider.isMetaMask
        : this.allProviders.some((p) => p.isMetaMask))
    );
  }

  get _metamask() {
    return (this.currentProvider as any)._metamask ?? {};
  }

  get isVigvam() {
    return this.selectedAddress
      ? this.currentProvider.isVigvam
      : this.allProviders.some((p) => p.isVigvam);
  }

  get chainId() {
    return this.currentProvider.chainId;
  }

  get networkVersion() {
    return this.currentProvider.networkVersion;
  }

  get selectedAddress() {
    return this.currentProvider.selectedAddress;
  }

  constructor(
    existingProviders: InpageProvider[],
    sharedProperty = false,
    private propIsMetaMaskPreferred = false
  ) {
    super();

    if (existingProviders.length === 0) {
      throw new Error("Must have at least one provider");
    }

    this.#sharedProperty = sharedProperty;

    this.currentProvider = existingProviders[0];
    this.#proxyEvents();

    this.addProviders(...existingProviders);

    // Fixes incorrect instance usage by some dApps >_<
    this.addProviders = this.addProviders.bind(this);
    this.request = this.request.bind(this);
    this.isConnected = this.isConnected.bind(this);
    this.sendAsync = this.sendAsync.bind(this);
    this.enable = this.enable.bind(this);
    this.send = this.send.bind(this);
    this.sendSync = this.sendSync.bind(this);
  }

  addProviders(...newProviders: InpageProvider[]) {
    for (const provider of newProviders) {
      if (this === (provider as any) || this.allProviders.includes(provider)) {
        continue;
      }

      this.allProviders.push(provider);

      provider.on("connect", () => setTimeout(() => this.#reshuffle()));
      provider.on("accountsChanged", () => this.#reshuffle());
    }

    this.#reshuffle();
  }

  #reshuffle() {
    const changeProvider = (provider: InpageProvider) => {
      if (provider === this.currentProvider) return;

      const prevProvider = this.currentProvider;

      this.currentProvider = provider;
      this.#proxyEvents();

      this.emit("accountsChanged", [provider.selectedAddress]);

      if (prevProvider.chainId !== provider.chainId) {
        this.emit("chainChanged", provider.chainId);
      }
      if (prevProvider.networkVersion !== provider.networkVersion) {
        this.emit("networkChanged", provider.networkVersion);
      }
    };

    if (this.#sharedProperty) {
      const enabledProviders = this.#enabledProviders;

      if (enabledProviders.length > 0) {
        changeProvider(
          enabledProviders.find((p) => p.selectedAddress) ?? enabledProviders[0]
        );
        return;
      }
    }

    if (this.selectedAddress) return;

    for (const provider of this.allProviders) {
      if (provider !== this.currentProvider && provider.selectedAddress) {
        changeProvider(provider);
        break;
      }
    }
  }

  #unsubEvents?: () => void;

  #proxyEvents() {
    this.#unsubEvents?.();

    const provider = this.currentProvider;
    const unsubs: (() => void)[] = [];

    if ((provider as any) === this) return;

    for (const type of EVENTS_TO_PROXY) {
      const handleEvent = (evt: any) => this.emit(type, evt);
      provider.on(type, handleEvent);
      unsubs.push(() => provider.removeListener(type, handleEvent));
    }

    this.#unsubEvents = () => {
      for (const unsubscribe of unsubs) {
        unsubscribe();
      }
    };
  }

  #requestPermissionsAll(
    factory: (provider: InpageProvider) => Promise<unknown>
  ) {
    return new Promise((res, rej) => {
      const providersToRequest = this.#enabledProviders;

      let done = false;
      let errors = 0;

      for (const provider of providersToRequest) {
        factory(provider)
          .then((result) => {
            if (done) return;
            done = true;

            this.allProviders = [
              provider,
              ...this.allProviders.filter((p) => p !== provider),
            ];

            res(result);
          })
          .catch((err) => {
            if (done) return;

            if (++errors === providersToRequest.length) {
              rej(err);
            }
          });
      }
    });
  }

  request(args: RequestArguments): Promise<unknown> {
    if (isPermissionMethod(args.method, this.currentProvider)) {
      return this.#requestPermissionsAll((p) => p.request(args));
    }

    return this.currentProvider.request(args);
  }

  isConnected() {
    return this.allProviders.some((p) => p.isConnected?.());
  }

  sendAsync(payload: any, callback: any): void {
    this.send(payload, callback);
  }

  enable() {
    return this.request({ method: JsonRpcMethod.eth_requestAccounts });
  }

  send(methodOrPayload: any, callbackOrArgs?: any): any {
    const method =
      typeof methodOrPayload === "string"
        ? methodOrPayload
        : methodOrPayload.method;

    if (isPermissionMethod(method, this.currentProvider)) {
      if (typeof callbackOrArgs !== "function") {
        return this.#requestPermissionsAll((p) =>
          p.send(methodOrPayload, callbackOrArgs)
        );
      } else {
        this.#requestPermissionsAll(
          (p) =>
            new Promise((res, rej) => {
              p.send(methodOrPayload, (err, result) => {
                if (err) return rej(err);
                res(result);
              });
            })
        )
          .then((result) => callbackOrArgs(null, result))
          .catch((error) => callbackOrArgs(error));

        return;
      }
    }

    return this.currentProvider.send(methodOrPayload, callbackOrArgs);
  }

  sendSync(payload: SendSyncJsonRpcRequest) {
    return this.currentProvider.sendSync(payload);
  }
}

function isPermissionMethod(method: string, currentProvider: InpageProvider) {
  return (
    method === JsonRpcMethod.wallet_requestPermissions ||
    (method === JsonRpcMethod.eth_requestAccounts &&
      !currentProvider.selectedAddress)
  );
}

const EVENTS_TO_PROXY = [
  "connect",
  "chainChanged",
  "networkChanged",
  "accountsChanged",
  "message",
];
