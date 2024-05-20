import {
  CryptoEngine,
  Kdbx,
  VarDictionary,
  Consts,
  Int64,
  Credentials,
  KdbxHeader,
  KdbxMeta,
  KdbxGroup,
  KdbxUuid,
  KdbxEntry,
  ProtectedValue,
  KdbxEntryField,
  ByteUtils,
} from "kdbxweb";

const { base64ToBytes, bytesToBase64, zeroBuffer } = ByteUtils;

export type KdfParams =
  | {
      type: "Aes";
      rounds: number;
    }
  | {
      type: "Argon2d" | "Argon2id";
      memory: number;
      iterations: number;
      parallelism: number;
    };

// The copy of https://github.com/keeweb/kdbxweb/blob/master/lib/format/kdbx.ts#L49
// But:
// - without special KeePass features, like RecycleBin, lastSelectedGroup, lastTopVisibleGroup
// - with own kdf params
export function createKdbx(
  credentials: Credentials,
  name: string,
  kdfParams: KdfParams,
) {
  const kdbx = new Kdbx();

  // Crerendtials
  kdbx.credentials = credentials;
  // Header
  kdbx.header = KdbxHeader.create();
  // Meta
  kdbx.meta = KdbxMeta.create();
  kdbx.meta._name = name;
  kdbx.meta.recycleBinEnabled = false;
  // Default group
  kdbx.createDefaultGroup();
  // KDF params
  applyKdfParams(kdbx, kdfParams);

  return kdbx;
}

export function applyKdfParams(kdbx: Kdbx, params: KdfParams) {
  const kdfParams = kdbx.header.kdfParameters;
  if (!kdfParams) {
    throw new Error("Cannot set KDF on this version");
  }

  const { ValueType } = VarDictionary;
  const { KdfId } = Consts;

  if (params.type === "Aes") {
    kdbx.setKdf(KdfId.Aes);
    // Rounds
    kdfParams.set("R", ValueType.UInt32, params.rounds);
  } else {
    const { type, memory, iterations, parallelism } = params;

    kdbx.setKdf(type === "Argon2id" ? KdfId.Argon2id : KdfId.Argon2d);
    // Memory
    kdfParams.set("M", ValueType.UInt64, Int64.from(memory));
    // Iterations
    kdfParams.set("I", ValueType.UInt64, Int64.from(iterations));
    // Parallelism
    kdfParams.set("P", ValueType.UInt32, parallelism);
  }
}

export function createGroup(
  parentGroup: KdbxGroup,
  uuid: string | KdbxUuid = KdbxUuid.random(),
) {
  const group = new KdbxGroup();
  group.uuid = toUuid(uuid);
  group.parentGroup = parentGroup;

  parentGroup.groups.push(group);

  return group;
}

export function setFields(
  entry: KdbxEntry,
  toSet: Record<string, KdbxEntryField>,
) {
  for (const [key, value] of Object.entries(toSet)) {
    entry.fields.set(key, value);
  }
}

export function exportFields<T extends { [k: string]: KdbxEntryField }>(
  entry: KdbxEntry,
  opts: { uuid?: boolean } = {},
) {
  const base: Record<string, string> = {};

  for (const [key, value] of entry.fields.entries()) {
    base[key] =
      value instanceof ProtectedValue ? exportProtected(value) : value;
  }

  if (opts.uuid) {
    base.uuid = entry.uuid.toString();
  }

  return base as T;
}

export function importProtected(str: string): ProtectedValue {
  const combined = base64ToBytes(str);

  const valueByteLength = combined.byteLength / 2;
  const value = combined.slice(0, valueByteLength);
  const prevSalt = combined.slice(valueByteLength, combined.byteLength);

  zeroBuffer(combined);

  const instance = new ProtectedValue(value, prevSalt);

  zeroBuffer(value);
  zeroBuffer(prevSalt);

  const nextSalt = CryptoEngine.random(valueByteLength);
  instance.setSalt(nextSalt);

  zeroBuffer(nextSalt);

  return instance;
}

export function exportProtected(origin: ProtectedValue): string {
  const cloned = origin.clone();

  // Refresh salt for export
  const nextSalt = CryptoEngine.random(cloned.byteLength);
  cloned.setSalt(nextSalt);

  const combined = new Uint8Array([...cloned.value, ...cloned.salt]);
  const str = bytesToBase64(combined);

  zeroBuffer(combined);

  return str;
}

export function toUuid(uuid: string | KdbxUuid) {
  return uuid instanceof KdbxUuid ? uuid : new KdbxUuid(uuid);
}
