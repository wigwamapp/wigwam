import { exportDB } from "dexie-export-import";
import { storage } from "lib/ext/storage";
import { replaceT } from "lib/ext/i18n";
import * as profile from "lib/ext/profile";

import * as repo from "core/repo";
import { Setting } from "core/common";

export async function exportCurrentProfile() {
  const { currentId, all } = await profile.loadState();
  const profileDump = all.find((p) => p.id === currentId)!;

  const storageKeys = [
    "vault_keyfile",
    "vault_data",
    ...Object.values(Setting),
  ];
  const storageValues = await storage.fetchMany(storageKeys);
  const storageDump = Object.fromEntries(
    storageKeys.map((k, i) => [k, storageValues[i]]),
  );

  const repoBlob = await exportDB(repo.db);

  const rest = { profile: profileDump, storage: storageDump };
  const restStr = JSON.stringify(rest);
  const restSizeStr = restStr.length.toString();

  if (restSizeStr.length > 16) {
    throw new Error("Too much storage for current export() implementation");
  }

  const meta = `${restSizeStr}${"_".repeat(16 - restSizeStr.length)}`;

  const packedBlob = new Blob([meta, restStr, repoBlob], {
    type: "application/json;charset=utf-8",
  });

  return {
    name: replaceT(profileDump.name),
    blob: packedBlob,
  };
}
