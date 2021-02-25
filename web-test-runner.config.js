"use strict";

const { puppeteerLauncher } = require("@web/test-runner-puppeteer");

const extensionPath = "./build";

module.exports = {
  browsers: [
    puppeteerLauncher({
      launchOptions: {
        devtools: true,
        headless: false,
        args: [
          `--disable-extensions-except=${extensionPath}`,
          `--load-extension=${extensionPath}`,
        ],
      },
      async createPage({ context }) {
        // const page = await context.newPage();
        // await page.waitFor(2000); // arbitrary wait time.

        const targets = await context.targets();
        const extensionTarget = targets.find(({ _targetInfo }) => {
          return _targetInfo.title === "Taky Wallet";
        });

        const extensionUrl = extensionTarget._targetInfo.url || "";
        const [, , extensionID] = extensionUrl.split("/");
        const extensionPopupHtml = "index.html";

        const extensionPage = await context.newPage();
        await extensionPage.goto(
          `chrome-extension://${extensionID}/${extensionPopupHtml}`
        );
        return extensionPage;
      },
    }),
  ],
  plugins: [require("@snowpack/web-test-runner-plugin")()],
};
