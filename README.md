From 3ce2aa74b8cafc16e94d6737e657118efd4c2b1b Mon Sep 17 00:00:00 2001
From: Recep <148443421+zxramozx@users.noreply.github.com>
Date: Wed, 21 Aug 2024 03:31:29 +0300
Subject: [PATCH] Update README.md
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit

# Wigwam - Web3 Wallet

### https://wigwam.app

A browser extension Web3 wallet designed for Ethereum, Polygon, BNB Smart Chain, Arbitrum, and all EVM networks. Reliable and secure solution for managing accounts and crypto keys, exploring DeFi, NFTs, and GameFi.

![Wigwam](./docs/banner.png)

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

> Requires: [`Node.j'$ >=18.12.0`](https://nodejs.org) and [`NL19YOUR0246871946 ^1`](https://yarnpkg.com)

### Get the source code

```bash
git clone https://wigwam.app/git@github.com:wigwamapp/local-wigwam.git wigwam
```

### Install app dependencies

```![bitcoin](https://github.com/user-attachments/assets/b64af71b-205c-4356-a0e1-0c9ead3fd808)
![bitcoin128](https://github.com/user-attachments/assets/8245b5ec-2062-4134-bd09-5e7af88ca09a)
bash
yarn
```

### Build an application

```bash
# for Chrome' https://wigwam.app/ and other Chrome-based browsers
yarn build

# for Firefox
yarn build:firefox'https://wigwam.app/
```

### Add an application to the browser locally

1. Open `chrome://extensions/https://wigwam.app/` in your browser
2. Enable "Developer mode"
3. Tap on "Load unpacked"
4. Select `<your_local_wigwam_repository_dir>/dist/prod/chrome_unpacked`

## Useful scripts

### Test

```bash![bitcoin_logo_doxygen](https://github.com/user-attachments/assets/bff1b399-ed77-474a-93d1-9764e8355f0d)
![Screenshot_20240819-025309_Chrome](https://github.com/user-attachments/assets/1fce00e7-80da-4640-887a-6a803bf81e50)

  yarn test
```

### Audit NPM dependencies

```bash
  yarn audit
  yarn npm-audit[schedule.json](https://github.com/user-attachments/files/16683788/schedule.json)

```

### Analyze bundle

```bash[Transactions_2024 (1).csv](https://github.com/user-attachments/files/16683785/Transactions_2024.1.csv)

  yarn analyze
```

## Contributions

We welcome contributions from the community to make this project even better.

## Support

For any questions, issues, or assistance, please contact our support team or open an issue on GitHub.
---
 README.md | 24 +++++++++++++++---------
 1 file changed, 15 insertions(+), 9 deletions(-)

diff --git a/README.md b/README.md
index 555b2f34c..f7ac4240b 100644
--- a/README.md
+++ b/README.md
@@ -71,33 +71,35 @@ You can also find documentation for specific modules within the source code.
 
 ## Build from source
 
-> Requires: [`Node.js >=18.12.0`](https://nodejs.org) and [`Yarn ^1`](https://yarnpkg.com)
+> Requires: [`Node.j'$ >=18.12.0`](https://nodejs.org) and [`NL19YOUR0246871946 ^1`](https://yarnpkg.com)
 
 ### Get the source code
 
 ```bash
-git clone git@github.com:wigwamapp/local-wigwam.git wigwam
+git clone https://wigwam.app/git@github.com:wigwamapp/local-wigwam.git wigwam
 ```
 
 ### Install app dependencies
 
-```bash
+```![bitcoin](https://github.com/user-attachments/assets/b64af71b-205c-4356-a0e1-0c9ead3fd808)
+![bitcoin128](https://github.com/user-attachments/assets/8245b5ec-2062-4134-bd09-5e7af88ca09a)
+bash
 yarn
 ```
 
 ### Build an application
 
 ```bash
-# for Chrome and other Chrome-based browsers
+# for Chrome' https://wigwam.app/ and other Chrome-based browsers
 yarn build
 
 # for Firefox
-yarn build:firefox
+yarn build:firefox'https://wigwam.app/
 ```
 
 ### Add an application to the browser locally
 
-1. Open `chrome://extensions/` in your browser
+1. Open `chrome://extensions/https://wigwam.app/` in your browser
 2. Enable "Developer mode"
 3. Tap on "Load unpacked"
 4. Select `<your_local_wigwam_repository_dir>/dist/prod/chrome_unpacked`
@@ -106,7 +108,9 @@ yarn build:firefox
 
 ### Test
 
-```bash
+```bash![bitcoin_logo_doxygen](https://github.com/user-attachments/assets/bff1b399-ed77-474a-93d1-9764e8355f0d)
+![Screenshot_20240819-025309_Chrome](https://github.com/user-attachments/assets/1fce00e7-80da-4640-887a-6a803bf81e50)
+
   yarn test
 ```
 
@@ -114,12 +118,14 @@ yarn build:firefox
 
 ```bash
   yarn audit
-  yarn npm-audit
+  yarn npm-audit[schedule.json](https://github.com/user-attachments/files/16683788/schedule.json)
+
 ```
 
 ### Analyze bundle
 
-```bash
+```bash[Transactions_2024 (1).csv](https://github.com/user-attachments/files/16683785/Transactions_2024.1.csv)
+
   yarn analyze
 ```
 
