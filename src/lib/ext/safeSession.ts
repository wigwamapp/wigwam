import { session } from "lib/ext/session";
import { getProfileId } from "lib/ext/profile";
import {
  utf8ToBytes,
  getRandomBytes,
  bytesToBase64,
  base64ToBytes,
  zeroBuffer,
  bytesToUtf8,
} from "lib/crypto-utils";

const BUILD_ID = process.env.BUILD_ID;

export async function persistSession(sessionKey: string, data: any) {
  try {
    // Generate crypto key for encryption
    const salt = getRandomBytes(32);
    const encKey = await getEncryptionKey(salt);

    // Encrypt
    const iv = getRandomBytes(16);
    const cipher = new Uint8Array(
      await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        encKey,
        utf8ToBytes(JSON.stringify(data)),
      ),
    );

    // Combine payload
    const payload = new Uint8Array([...salt, ...iv, ...cipher]);
    zeroBuffer(salt);
    zeroBuffer(iv);
    zeroBuffer(cipher);

    // Serealize payload
    const payloadB64 = bytesToBase64(payload);
    zeroBuffer(payload);

    // Persist
    await session.put(sessionKey, payloadB64);
  } catch (err) {
    console.error("Failed to persist session", err);
  }
}

export async function retrieveSession<T = any>(sessionKey: string) {
  try {
    const payloadB64 = await session.fetchForce<string>(sessionKey);
    if (!payloadB64) return null;

    const payload = base64ToBytes(payloadB64);

    // Decompose payload to parts
    let index = 0;
    const pick = (length?: number) =>
      payload.slice(index, length && (index += length));

    const salt = pick(32);
    const iv = pick(16);
    const cipher = pick();

    zeroBuffer(payload);

    // Generate crypto key for decryption
    const encKey = await getEncryptionKey(salt);
    zeroBuffer(salt);

    // Decrypt
    const dataBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      encKey,
      cipher,
    );
    zeroBuffer(iv);
    zeroBuffer(cipher);

    const data: T = JSON.parse(bytesToUtf8(new Uint8Array(dataBuf)));
    zeroBuffer(dataBuf);

    return data;
  } catch (err) {
    console.error("Failed to retrieve session", err);
    return null;
  }
}

export async function cleanupSession(sessionKey: string) {
  await session.remove(sessionKey).catch(console.error);
}

async function getEncryptionKey(salt: Uint8Array) {
  const encEntropy = await getEncryptionEntropy();

  // Generate crypto key
  const encKey = await crypto.subtle.importKey(
    "raw",
    encEntropy,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );
  zeroBuffer(encEntropy);

  // Derive crypto key with salt
  const derivedEncKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 10_000,
      hash: "SHA-512",
    },
    encKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  return derivedEncKey;
}

async function getEncryptionEntropy() {
  const profileId = await getProfileId();

  // Use build id and profile id as additional encryption entropy
  const keyData = [BUILD_ID, profileId].join("_");

  return crypto.subtle.digest("SHA-256", utf8ToBytes(keyData));
}
