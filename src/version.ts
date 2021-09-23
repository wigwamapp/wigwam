// Avoid typescript "isolatedModules" error;
export {};

const vigvamApps =
  (window as any)._vigvamApps ?? ((window as any)._vigvamApps = []);

const extId = document.currentScript?.dataset.extid ?? "";
const version = process.env.VERSION;

vigvamApps.push({ extId, version });
