// Avoid typescript "isolatedModules" error;
export {};

declare const browser: any;

const extId = (chrome ?? browser)?.runtime?.id;
if (extId) {
  document.cookie = `_vigvam_${extId}=${process.env.VERSION}; SameSite=Lax`;
}
