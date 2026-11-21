import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";
export function encryptSecret(value: string, secret: string): string {
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}
export function decryptSecret(value: string, secret: string): string {
  const [iv, tag, data] = value.split(".");
  if (!iv || !tag || !data) throw new Error("Encrypted credential is malformed.");
  const decipher = createDecipheriv("aes-256-gcm", createHash("sha256").update(secret).digest(), Buffer.from(iv,"base64url"));
  decipher.setAuthTag(Buffer.from(tag,"base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data,"base64url")),decipher.final()]).toString("utf8");
}
export function signValue(value: string, secret: string): string {
  return createHash("sha256").update(secret).update(".").update(value).digest("base64url");
}
export function safeEqual(a: string, b: string): boolean {
  const aa=Buffer.from(a), bb=Buffer.from(b);
  return aa.length===bb.length && timingSafeEqual(aa,bb);
}
