const ROOT_PREFIX = "v";

/**
 * Schema
 */

export enum Prefix {
  Check = "check",
  MigrationLevel = "migration_level",
  SeedPhrase = "seed_phrase",
  PrivateKey = "private_key",
  PublicKey = "public_key",
}

export const Data = {
  check: createStatic(Prefix.Check),
  migrationLevel: createStatic(Prefix.MigrationLevel),
  seedPhrase: createStatic(Prefix.SeedPhrase),
  privateKey: createDynamic(Prefix.PrivateKey),
  publicKey: createDynamic(Prefix.PublicKey),
};

/**
 * Migrations
 */
export type Migration = (key: CryptoKey) => Promise<void>;

export const MIGRATIONS: ReadonlyArray<Migration> = [];

/**
 * Data Item factories
 *
 * Every data item is just abtraction over keys in key-value storage
 */

type Part = string | number;

type DataItem = {
  (): string;
  <T>(val: T): [string, T];
};

function createStatic(prefix: Prefix, subPart?: Part): DataItem {
  const key = combine(ROOT_PREFIX, prefix, subPart);
  return (val?: any) =>
    typeof val === "undefined" ? key : ([key, val] as any);
}

function createDynamic(prefix: Prefix) {
  return (part: Part) => createStatic(prefix, part);
}

function combine(...parts: (Part | undefined)[]) {
  return parts.filter((p) => typeof p !== "undefined").join("_");
}
