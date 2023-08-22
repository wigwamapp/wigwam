# core/inpage

Implementation of [Ethereum Provider JavaScript API (EIP-1193)](https://eips.ethereum.org/EIPS/eip-1193)

A common convention in the Ethereum web application (“dapp”) ecosystem is for key management software (“wallets”) to expose their API via a JavaScript object in the web page. This object is called “the Provider”.

## Main modules

- [`protocol.ts`](./protocol.ts) - Communication between the ContentScript (extension environment) and the InpageScript (page environment) and vice versa.
- [`provider.ts`](./provider.ts) - Executes in InpageScript. Implementation of EIP-1193 Provider (`window.ethereum`).
- [`universalProvider.ts`](./universalProvider.ts) - This extends the same EIP-1193 Provider API but enables the seamless switching between multiple providers under the hood. It orchestrates the interaction between the providers injected by this extension and other extensions.

## Credits

- [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193)
- [Metamask Inpage Provider](https://github.com/MetaMask/providers)
