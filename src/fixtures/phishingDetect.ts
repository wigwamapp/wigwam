import BASE from "eth-phishing-detect/src/config.json";

export const PHISHING_DETECT_CONFIG = { ...BASE };
PHISHING_DETECT_CONFIG.fuzzylist.push("vigvam.app");
PHISHING_DETECT_CONFIG.whitelist.push("vigvam.app");
