export async function getPasswordHash(password: string) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    Buffer.from(password, "utf8")
  );
  return Buffer.from(hash).toString("hex");
}
