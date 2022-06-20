import { Emitter } from "lib/emitter";

import {
  RequestArguments,
  SendSyncJsonRpcRequest,
  JsonRpcMethod,
} from "core/types/rpc";

import type { InpageProvider } from "./provider";

export class UniversalInpageProvider extends Emitter {
  #allProviders: InpageProvider[] = [];
  #currentProvider: InpageProvider;

  get allPoviders() {
    return this.#allProviders;
  }

  get currentProvider() {
    return this.#currentProvider;
  }

  get isMetaMask() {
    return this.selectedAddress
      ? this.#currentProvider.isMetaMask
      : this.#allProviders.some((p) => p.isMetaMask);
  }

  get _metamask() {
    return (this.#currentProvider as any)._metamask ?? {};
  }

  get isVigvam() {
    return this.selectedAddress
      ? this.#currentProvider.isVigvam
      : this.#allProviders.some((p) => p.isVigvam);
  }

  get chainId() {
    return this.#currentProvider.chainId;
  }

  get networkVersion() {
    return this.#currentProvider.networkVersion;
  }

  get selectedAddress() {
    return this.#currentProvider.selectedAddress;
  }

  constructor(existingProviders: InpageProvider[]) {
    super();

    if (existingProviders.length === 0) {
      throw new Error("Must have at least one provider");
    }

    this.#currentProvider = existingProviders[0];
    this.#proxyEvents();

    this.addProviders(...existingProviders);
  }

  addProviders(...newProviders: InpageProvider[]) {
    for (const provider of newProviders) {
      this.#allProviders.push(provider);

      provider.on("connect", () => setTimeout(() => this.#reshuffle()));
      provider.on("accountsChanged", () => this.#reshuffle());
    }

    this.#reshuffle();
  }

  #reshuffle() {
    if (this.selectedAddress) return;

    for (const provider of this.#allProviders) {
      if (provider !== this.#currentProvider && provider.selectedAddress) {
        const prevProvider = this.#currentProvider;

        this.#currentProvider = provider;
        this.#proxyEvents();

        this.emit("accountsChanged", [provider.selectedAddress]);

        if (prevProvider.chainId !== provider.chainId) {
          this.emit("chainChanged", provider.chainId);
        }
        if (prevProvider.networkVersion !== provider.networkVersion) {
          this.emit("networkChanged", provider.networkVersion);
        }

        break;
      }
    }
  }

  #unsubEvents?: () => void;

  #proxyEvents() {
    this.#unsubEvents?.();

    const provider = this.#currentProvider;
    const unsubs: (() => void)[] = [];

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
      let done = false;
      let errors = 0;

      for (const provider of this.#allProviders) {
        factory(provider)
          .then((result) => {
            if (done) return;
            done = true;

            this.#allProviders = [
              provider,
              ...this.#allProviders.filter((p) => p !== provider),
            ];

            res(result);
          })
          .catch((err) => {
            if (done) return;

            if (++errors === this.#allProviders.length) {
              rej(err);
            }
          });
      }
    });
  }

  request(args: RequestArguments): Promise<unknown> {
    if (isPermissionMethod(args.method, this.#currentProvider)) {
      return this.#requestPermissionsAll((p) => p.request(args));
    }

    return this.#currentProvider.request(args);
  }

  isConnected() {
    return this.#allProviders.some((p) => p.isConnected?.());
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

    if (isPermissionMethod(method, this.#currentProvider)) {
      if (typeof methodOrPayload === "string") {
        return this.#requestPermissionsAll((p) =>
          p.send(methodOrPayload, callbackOrArgs)
        );
      } else {
        this.#requestPermissionsAll((p) => p.send(methodOrPayload))
          .then((result) => callbackOrArgs(null, result))
          .catch((error) => callbackOrArgs(error));

        return;
      }
    }

    return this.#currentProvider.send(methodOrPayload, callbackOrArgs);
  }

  sendSync(payload: SendSyncJsonRpcRequest) {
    return this.#currentProvider.sendSync(payload);
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
