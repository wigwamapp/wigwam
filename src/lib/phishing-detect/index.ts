import memoize from "mem";
import memoizeOne from "memoize-one";
import PhishingDetector from "eth-phishing-detect/src/detector";
import { getPhishingDetectConfig } from "fixtures/phishingDetect";

export const isPhishingWebsite = memoize(
  async (hostname: string): Promise<boolean> => {
    const detector = await getDetector();
    const reason = detector.check(hostname);

    return reason.result && reason.type === "blacklist";
  },
);

const getDetector = memoizeOne(
  async () => new PhishingDetector(await getPhishingDetectConfig()),
);
