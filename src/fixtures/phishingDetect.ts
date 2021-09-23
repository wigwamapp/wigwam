import BASE from "eth-phishing-detect/src/config.json";

const WEBSITE_HOST = new URL(process.env.VIGVAM_WEBSITE_ORIGIN).host;

export const PHISHING_DETECT_CONFIG = { ...BASE };
PHISHING_DETECT_CONFIG.fuzzylist.push(WEBSITE_HOST);
PHISHING_DETECT_CONFIG.whitelist.push(WEBSITE_HOST);
