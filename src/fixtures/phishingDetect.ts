import BASE from "eth-phishing-detect/src/config.json";

const WEBSITE_ORIGIN = process.env.WIGWAM_WEBSITE_ORIGIN;
const WEBSITE_HOST = WEBSITE_ORIGIN && new URL(WEBSITE_ORIGIN).host;

export const PHISHING_DETECT_CONFIG = {
  ...BASE,
  fuzzylist: [...BASE.fuzzylist, WEBSITE_HOST],
  whitelist: [...BASE.whitelist, WEBSITE_HOST],
};
