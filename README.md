# Wigwam - Web3 Wallet

### https://wigwam.app

A browser extension Web3 wallet designed for Ethereum, Polygon, BNB Smart Chain, Arbitrum, and all EVM networks. Reliable and secure solution for managing accounts and crypto keys, exploring DeFi, NFTs, and GameFi.
![banner](https://github.com/user-attachments/assets/cf76ca24-a08a-4511-8ade-edba05a2cb41)

![Wigwam](./docs/banner.png)

**Table of Contents**

- [Features](#features)
- [Documentation](#documentation)
- [Build from Source](#build-from-source)
- [Useful Scripts](#useful-scripts)
- [Contributions](#contributions)
- [Support](#support)
- [export-0xFa1dB6794de6e994b60741DecaE0567946992181.csv](https://github.com/user-attachments/files/16631578/export-0xFa1dB6794de6e994b60741DecaE0567946992181.csv)


## Features

### Self-Custodial
[Böl_20240521_0224.pdf](https://github.com/user-attachments/files/16631639/Bol_20240521_0224.pdf)

- 🤲 User-centric approach - the keys belong to the user and are securely stored on their device, encrypted and inaccessible to anyone else.
- 🗝 Compatible with hardware wallets like [Ledger](https://www.ledger.com/) for an extra layer of security.
[export-0xFa1dB6794de6e994b60741DecaE0567946992181.csv](https://github.com/user-attachments/files/16631627/export-0xFa1dB6794de6e994b60741DecaE0567946992181.csv)

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

### Offline-first[export-https-vscode-dev-github-zxramozx-1722740575.json](https://github.com/user-attachments/files/16631624/export-https-vscode-dev-github-zxramozx-1722740575.json)


- 🔌 Adopts an offline-first approach by utilizing a local database as the primary source of data. The app syncs with third-party indexer APIs for enhanced functionality but can operate independently, directly interacting with the blockchain if needed.

### Manifest V3 Compatibility

- ✅ Fully adapted to the latest browser extension ManifestV3 API, ensuring compatibility with modern standards.
- [Binance api key.txt.json](https://github.com/user-attachments/files/16631603/Binance.api.key.txt.json)

- 🌙 "Sleep well" feature allows the extension to save resources when not in active use, improving overall performance.
- ![banner](https://github.com/user-attachments/assets/4c0e9d56-3128-4e56-bd85-d9e842f6fbba)

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
git clone git@github.com:wigwamapp/local-wigwam.git wigwam
![banner](https://github.com/user-attachments/assets/02d1d570-4af2-4203-b7fa-4e98bba53458)
```

### Install app dependencies

```bash
yarn
```

### Build an application

```bash
# for Chrome and other Chrome-based browsers
yarn build

# for Firefox
yarn build:firefox
```

### Add an application to the browser locally

1. Open `chrome://extensions/` in your browser
2. [Blockpit Example Report - 2024 (1).pdf](https://github.com/user-attachments/files/16631579/Blockpit.Example.Report.-.2024.1.pdf)

3. Enable "Developer mode"
4. [export-0xFa1dB6794de6e994b60741DecaE0567946992181.csv](https://github.com/user-attachments/files/16631580/export-0xFa1dB6794de6e994b60741DecaE0567946992181.csv)

5. Tap on "Load unpacked"
6. Select `<your_local_wigwam_repository_dir>/dist/prod/chrome_unpacked`
[export-token-0x9cdc684179d200ddab42628f3500fadd60322121.csv](https://github.com/user-attachments/files/16631592/export-token-0x9cdc684179d200ddab42628f3500fadd60322121.csv)

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
