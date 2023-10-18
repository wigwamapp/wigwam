import memoize from "mem";
import memoizeOne from "memoize-one";
import PhishingDetector from "eth-phishing-detect/src/detector";
import { PHISHING_DETECT_CONFIG } from "fixtures/phishingDetect";

export const isPhishingWebsite = memoize((hostname: string): boolean => {
  const reason = getDetector().check(hostname);

  return reason.result && reason.type === "blacklist";
});

const getDetector = memoizeOne(
  () => new PhishingDetector(PHISHING_DETECT_CONFIG),
);
