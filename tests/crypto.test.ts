import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, safeEqual, signValue } from "../lib/drive/crypto";

describe("Crypto primitives", () => {
  const secretKey = "super-secret-encryption-key-for-testing-only";
  const samplePayload = "google-refresh-token-1234567890-test";

  it("encrypts and decrypts payload correctly (roundtrip)", () => {
    const encrypted = encryptSecret(samplePayload, secretKey);
    expect(encrypted).not.toBe(samplePayload);
    const parts = encrypted.split(".");
    expect(parts.length).toBe(3);

    const decrypted = decryptSecret(encrypted, secretKey);
    expect(decrypted).toBe(samplePayload);
  });

  it("produces non-deterministic ciphertext for identical plaintext due to random IV", () => {
    const enc1 = encryptSecret(samplePayload, secretKey);
    const enc2 = encryptSecret(samplePayload, secretKey);
    expect(enc1).not.toBe(enc2);
    expect(decryptSecret(enc1, secretKey)).toBe(samplePayload);
    expect(decryptSecret(enc2, secretKey)).toBe(samplePayload);
  });

  it("throws on malformed encrypted payload", () => {
    expect(() => decryptSecret("invalid-payload", secretKey)).toThrow(/malformed/i);
    expect(() => decryptSecret("iv.tag", secretKey)).toThrow(/malformed/i);
  });

  it("fails decryption if ciphertext, iv, or tag is tampered", () => {
    const encrypted = encryptSecret(samplePayload, secretKey);
    const [iv, tag, data] = encrypted.split(".");
    // Tamper with tag
    const tamperedTag = tag.slice(0, -2) + (tag.slice(-1) === "A" ? "B" : "A");
    expect(() => decryptSecret([iv, tamperedTag, data].join("."), secretKey)).toThrow();

    // Tamper with data
    const tamperedData = data.slice(0, -2) + (data.slice(-1) === "A" ? "B" : "A");
    expect(() => decryptSecret([iv, tag, tamperedData].join("."), secretKey)).toThrow();
  });

  it("fails decryption if wrong secret key is provided", () => {
    const encrypted = encryptSecret(samplePayload, secretKey);
    expect(() => decryptSecret(encrypted, "different-wrong-secret-key")).toThrow();
  });

  it("signs values reproducibly and validates safeEqual", () => {
    const sig1 = signValue("test-data", secretKey);
    const sig2 = signValue("test-data", secretKey);
    expect(sig1).toBe(sig2);

    expect(safeEqual("identical-string", "identical-string")).toBe(true);
    expect(safeEqual("identical-string", "different-string")).toBe(false);
    expect(safeEqual("short", "longer-string")).toBe(false);
  });
});
