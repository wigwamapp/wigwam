import defaultConfig from "eth-phishing-detect/src/config.json";

const WEBSITE_ORIGIN = process.env.WIGWAM_WEBSITE_ORIGIN;
const WEBSITE_HOST = WEBSITE_ORIGIN && new URL(WEBSITE_ORIGIN).host;

export const getPhishingDetectConfig = () =>
  getBase().then((base) => ({
    ...base,
    fuzzylist: [...base.fuzzylist, WEBSITE_HOST],
    whitelist: [...base.whitelist, WEBSITE_HOST],
  }));

export const getBase = (): Promise<typeof defaultConfig> =>
  fetch(
    "https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/refs/heads/main/src/config.json",
  )
    .then((res) => {
      if (!res.ok) throw new Error(res.statusText);

      return res.json();
    })
    .catch((err) => {
      console.error("Failed to obtain config", err);
      return defaultConfig;
    });
