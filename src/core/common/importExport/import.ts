import { importDB } from "dexie-export-import";
import { StorageArea } from "lib/ext/storageArea";
import { Profile, assertProfileNotExist, appendProfile } from "lib/ext/profile";

export async function importProfile(blobPack: Blob) {
  const metaBlob = blobPack.slice(0, 16);
  const meta = await metaBlob.text();

  const restSize = parseInt(meta.replace(/_/g, ""));
  const restBlob = blobPack.slice(16, restSize + 16);

  const rest = JSON.parse(await restBlob.text());

  const repoBlob = blobPack.slice(restSize + 16, blobPack.size);

  const profileId = rest.profile.id;

  await assertProfileNotExist(profileId);

  const storageArea = new StorageArea("local", {
    keyMapper: (key) => `${profileId}${key}`,
  });

  await importDB(repoBlob);

  await storageArea.putMany(rest.storage);
  await appendProfile(rest.profile);

  return rest.profile as Profile;
}
