import defaultConfig from "eth-phishing-detect/src/config.json";

export const getPhishingDetectConfig = () =>
  getBase().then((base) => ({
    ...base,
    fuzzylist: base.fuzzylist,
    whitelist: base.whitelist,
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
