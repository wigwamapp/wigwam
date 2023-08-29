# Project strucrture

## Assets (static files or templates)

- [`public/manifest.json`](../public/manifest.json) - The extension configuration file and the main entry point of the app. This file is a template with parameters such as `pkg`, `env`, `envBadge`, and `website`. And it allows for the separation of configurations for different browsers using special keys like `{ __chrome__version: "1.0.0", __firefox__version: "0.1.0.0" }`.

- [`public/icons`](../public/icons) - Images used as the extension's icon, as well as those that can be used not only in JavaScript, such as network/currency icons.

- [`public/locales`](../public/locales) - Content for internationalization (i18n). Provided in [JSON format](https://www.i18next.com/misc/json-format#i18next-json-v2), - as outlined in the i18next JSON v2 format, but without nesting. It will be bundled into the browser extension's version during the build process.

- [`public/sw.js`](../public/sw.js) - The entrypoint for extension background worker, aka "backend". Since ManifestV3 this is a Service Worker.
- [`public/main.html`](../public/main.html) - The main view for extension self tabs.
- [`public/popup.html`](../public/popup.html) - The extension popup view, browser toolbar.
- [`public/approve.html`](../public/approve.html) - The view for transaction approvals, popup that opened as a separate window.

## Source code

### Entrypoints

- [`src/back.ts`](../src/back.ts) - The entry script for background worker. Will be bundled using `public/sw.js` as template.
- [`src/{main,popup,approve}.tsx`](../src/main.tsx) - The scripts that bundled and added to the corresponding html views. Just the regular react app, but different for each.
- [`src/{content,inpage}.ts`](../src/content.ts) - The "content scripts" that used for Web3 protocol, to communicate with decentralized applications. Will be injected in the browser tabs at runtime.
- [`src/version.ts`](../src/version.ts) - Also the "content script", but used to communicate with the wallet website. For example to understand on website is wallet already installed or not.

### Dirs

- [`src/_dev`](../src/_dev/) - This directory contains development tools such as hot reload, typings, and other non-essential items.
- [`src/fixtures`](../src/fixtures/) - The configs and some default or constant values.
- [`src/app`](../src/app/) - The UI for the app. React application + TailwindCSS.
- [`src/core`](../src/core/) - This core business logic, encompassing several components:
  1. [`common/`](../src/core/common/): Houses utilities shared between both the backend and client-side.
  2. [`back/`](../src/core/back/): Comprises the background script portion.
  3. [`client/`](../src/core/client/): Provides wrappers and utilities for facilitating communication between the user interface and the business logic.
  4. [`repo/`](../src/core/repo/): Represents the Indexed Database using Dexie.js.
  5. [`inpage`](../src/core/inpage/): Contains the code intended to run in the browser page, specifically for the Web3 protocol.
- [`src/lib`](../src/lib/) - The modules that are independent from the main project's business logic, such as wrappers and utilities. Or, in other words, modules that could be separate npm packages.
