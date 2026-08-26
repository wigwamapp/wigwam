# OG Wallet - Web3 Wallet

### https://ogwallet.tech

A browser extension Web3 wallet designed for Ethereum, Polygon, BNB Chain, Arbitrum, and all EVM networks. Reliable and secure solution for managing accounts and crypto keys, exploring DeFi, NFTs, and GameFi.

<!-- TODO REBRANDING: replace banner artwork -->

![OG Wallet](./docs/banner.png)

**Table of Contents**

- [Features](#features)
- [Documentation](#documentation)
- [Build from Source](#build-from-source)
- [Useful Scripts](#useful-scripts)
- [Contributions](#contributions)
- [Support](#support)

## Features

### Self-Custodial

- 🤲 User-centric approach - the keys belong to the user and are securely stored on their device, encrypted and inaccessible to anyone else.
- 🗝 Compatible with hardware wallets like [Ledger](https://www.ledger.com/) for an extra layer of security.

### Security First

- 🛡 Utilizes battle-proof techniques for encrypting and storing sensitive data, which are commonly used in password managers, to protect user data.

### Dapp Integration

- 🌐 Seamlessly connects with decentralized applications (dApps) across various EVM networks.
- 💼 Supports all the latest Web3 standards.

### Full-Page Dashboard

- 📊 Features a comprehensive full-page dashboard within the app, providing detailed information about accounts, transactions, and assets.
- 📈 Stay updated on your portfolio and activities within the Web3 ecosystem.

### Multi-Network Support

- 🔗 Designed to be multi-network, allowing to switch between networks effortlessly.
- 🌐 Easily manage assets and explore the diverse opportunities offered by different networks.

### Open Source

- 📖 Committed to transparency and community-driven development. The project is open source, allowing developers to review and contribute to the codebase.

### User-Friendly Interface

- 🖥️ The user interface is intuitive and user-friendly, making it easy for both newcomers and experienced users to navigate and utilize the wallet's features.

### Offline-first

- 🔌 Adopts an offline-first approach by utilizing a local database as the primary source of data. The app syncs with third-party indexer APIs for enhanced functionality but can operate independently, directly interacting with the blockchain if needed.

### Manifest V3 Compatibility

- ✅ Fully adapted to the latest browser extension ManifestV3 API, ensuring compatibility with modern standards.
- 🌙 "Sleep well" feature allows the extension to save resources when not in active use, improving overall performance.

### Lightweight

- ⚡️ Designed with efficiency in mind to ensure a lightweight and responsive user experience.

## Documentation

- [**General Tech Documentation**](docs/README.md)
- [**Security Documentation**](docs/SECURITY.md)

You can also find documentation for specific modules within the source code.

## Build from source

> Requires: [`Node.js >=18.12.0`](https://nodejs.org) and [`Yarn ^1`](https://yarnpkg.com)

### Get the source code

```bash
git clone git@github.com:wigwamapp/wigwam.git
```

### Install app dependencies

```bash
yarn
```

### Build an application

```bash
yarn build
```

### Add an application to the browser locally

1. Open `chrome://extensions/` in your browser
2. Enable "Developer mode"
3. Tap on "Load unpacked"
4. Select `<your_local_ogwallet_repository_dir>/dist/prod/chrome_unpacked`

## Useful scripts

### Test

```bash
  yarn test
```

### Audit NPM dependencies

```bash
  yarn audit
  yarn npm-audit
```

### Analyze bundle

```bash
  yarn analyze
```

## Contributions

We welcome contributions from the community to make this project even better.

## Support

For any questions, issues, or assistance, please contact our support team or open an issue on GitHub.
