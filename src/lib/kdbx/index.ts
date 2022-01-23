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
} from "kdbxweb";
import * as Argon2 from "lib/argon2";
import { assert } from "lib/system/assert";

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

export function setupArgon2Impl() {
  CryptoEngine.setArgon2Impl(
    (pass, salt, mem, time, hashLen, parallelism, type) =>
      Argon2.hash({
        pass: new Uint8Array(pass),
        salt: new Uint8Array(salt),
        mem,
        time,
        hashLen,
        parallelism,
        type,
      }).then(({ hash }) => hash)
  );
}

// The copy of https://github.com/keeweb/kdbxweb/blob/master/lib/format/kdbx.ts#L49
// But:
// - without special KeePass features, like RecycleBin, lastSelectedGroup, lastTopVisibleGroup
// - with own kdf params
export function createKdbx(
  credentials: Credentials,
  name: string,
  kdfParams: KdfParams
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

export function createGroup(parentGroup: KdbxGroup, uuid = KdbxUuid.random()) {
  const group = new KdbxGroup();
  group.uuid = uuid;
  group.parentGroup = parentGroup;

  parentGroup.groups.push(group);

  return group;
}

export function getFieldText(entry: KdbxEntry, fieldName: string) {
  const field = entry.fields.get(fieldName);
  assert(field, "Field not found");

  return field instanceof ProtectedValue ? field.getText() : field;
}

export function setFields(
  entry: KdbxEntry,
  toSet: Record<string, KdbxEntryField>
) {
  for (const [key, value] of Object.entries(toSet)) {
    entry.fields.set(key, value);
  }
}

export function getFields<T extends { [k: string]: KdbxEntryField }>(
  entry: KdbxEntry,
  opts: { uuid?: boolean } = {}
) {
  const base = Object.fromEntries(entry.fields.entries());

  if (opts.uuid) {
    base.uuid = entry.uuid.toString();
  }

  return base as T;
}

export function toUuid(uuid: string | KdbxUuid) {
  return uuid instanceof KdbxUuid ? uuid : new KdbxUuid(uuid);
}

// export class PV extends ProtectedValue {
//   toProtectedString() {
//     return this.
//   }
// }
