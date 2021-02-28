export type Migration = (passwordKey: CryptoKey) => Promise<void>;

export enum StorageEntity {
  Check = "check",
  MigrationLevel = "mgrnlvl",
  SeedPhrase = "seedphrase",
  AccPrivKey = "accprivkey",
  AccPubKey = "accpubkey",
}

export const STORAGE_KEY_PREFIX = "v";
export const MIGRATIONS: ReadonlyArray<Migration> = [];

export const checkStrgKey = createStorageKey(StorageEntity.Check);
export const migrationLevelStrgKey = createStorageKey(
  StorageEntity.MigrationLevel
);
export const seedPhraseStrgKey = createStorageKey(StorageEntity.SeedPhrase);
export const accPrivKeyStrgKey = createDynamicStorageKey(
  StorageEntity.AccPrivKey
);
export const accPubKeyStrgKey = createDynamicStorageKey(
  StorageEntity.AccPubKey
);

/**
 * Helpers
 */

function createStorageKey(id: StorageEntity) {
  return combineStorageKey(STORAGE_KEY_PREFIX, id);
}

function createDynamicStorageKey(id: StorageEntity) {
  const keyBase = combineStorageKey(STORAGE_KEY_PREFIX, id);
  return (subKey: number | string) => combineStorageKey(keyBase, subKey);
}

function combineStorageKey(...parts: (string | number)[]) {
  return parts.join("_");
}
