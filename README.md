# Vigvam

### https://vigvam.app

An app that manages your wallets and crypto keys.<br />Explore DeFi and NFTs.<br />Ethereum, BSC, Polygon, Optimism and others.

[![Vigvam](https://user-images.githubusercontent.com/11996139/146784241-7082320b-50f8-46c9-b4e4-b6dfad004824.png)](https://vigvam.app/)

## Features

- 🧩 A classic browser extension.

- 🌐 Fast and simple interaction with Web 3.0 world.

- 🤲 Non-custodial. We don't have a server or a central hub. The keys belong to the user and are stored on his device in encrypted form.

- 📖 Open source.

- 🔐 Uses the best Security approaches.

- 🔌 Support for [Ledger](https://www.ledger.com/) devices.

- 👥 Support for Social Auth with [Open Login](https://openlogin.com/).

- ⚡️ Lightweight.

## Build from source

> Requires: [`Node.js ^14`](https://nodejs.org) and [`Yarn ^2`](https://yarnpkg.com)

### Get the source code

```bash
git clone git@github.com:vigvamapp/vigvam.git && cd vigvam
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
2. Enable "Developer mode"
3. Tap on "Load unpacked"
4. Select `<your_local_vigvam_repository_dir>/dist/prod/chrome_unpacked`

## Misc scripts

### Test

```bash
  yarn test
```

### Audit NPM dependencies

```bash
  yarn npm-audit
```

### Analyze bundle

```bash
  yarn analyze
```
