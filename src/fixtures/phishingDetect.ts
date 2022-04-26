import BASE from "eth-phishing-detect/src/config.json";

const WEBSITE_HOST = new URL(process.env.VIGVAM_WEBSITE_ORIGIN).host;

export const PHISHING_DETECT_CONFIG = {
  ...BASE,
  fuzzylist: [...BASE.fuzzylist, WEBSITE_HOST],
  whitelist: [...BASE.whitelist, WEBSITE_HOST],
};
