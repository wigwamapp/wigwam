import { nanoid, customAlphabet } from "nanoid";

import { Profile } from "./types";

export function generateProfile(name: string): Profile {
  const id = generateProfileId();
  const avatarSeed = nanoid();

  return { id, name, avatarSeed };
}

export const generateProfileId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  11
);
