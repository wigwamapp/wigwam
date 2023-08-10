import { persistSession, cleanupSession } from "lib/ext/safeSession";
import { PASSWORD_SESSION } from "core/types";

export type PasswordSession = {
  passwordHash: string;
  timestamp: number;
};

export function persistPasswordSession(passwordHash: string) {
  const timestamp = Date.now();
  const data: PasswordSession = { passwordHash, timestamp };

  return persistSession(PASSWORD_SESSION, data);
}

export function cleanupPasswordSession() {
  return cleanupSession(PASSWORD_SESSION);
}
