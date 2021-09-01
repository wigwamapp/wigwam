let detector: any;

export async function isNotPhishing(origin: string): Promise<boolean> {
  if (!detector) {
    const [{ default: PhishingDetector }, { PHISHING_DETECT_CONFIG }] =
      await Promise.all([
        import("eth-phishing-detect/src/detector"),
        import("fixtures/phishingDetect"),
      ]);

    detector = new PhishingDetector(PHISHING_DETECT_CONFIG);
  }

  return detector.check(origin).result;
}
