import { beforeEach, describe, expect, it, vi } from "vitest";

type MockCookie = {
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
  path?: string;
  maxAge?: number;
};

const mockCookieStore = new Map<string, MockCookie>();

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockImplementation(async () => ({
    get: (key: string) => mockCookieStore.get(key),
    set: (key: string, value: string, options: Partial<MockCookie>) => {
      mockCookieStore.set(key, { value, ...options });
    },
    delete: (key: string) => {
      mockCookieStore.delete(key);
    },
  })),
}));

describe("Session management", () => {
  const adminEmail = "roshithrag@gmail.com";
  const authSecret = "test-auth-secret-key-32-chars-long!";

  beforeEach(() => {
    mockCookieStore.clear();
    process.env.ADMIN_EMAIL = adminEmail;
    process.env.AUTH_SECRET = authSecret;
    process.env.GOOGLE_CLIENT_ID = "mock-id";
    process.env.GOOGLE_CLIENT_SECRET = "mock-secret";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/api/admin/drive/callback";
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID = "1hY1TfUftj8WDHSOGoSR-dsPcrkZe33Ea";
    process.env.DATABASE_URL = "postgres://user:pass@host/db";
    process.env.TOKEN_ENCRYPTION_KEY = "test-encryption-key";
  });

  it("creates an admin session cookie for the authorized administrator", async () => {
    const { createAdminSession, isAdminSession } = await import("../lib/drive/session");
    await createAdminSession(adminEmail);

    expect(mockCookieStore.has("stillframe_admin")).toBe(true);
    const cookie = mockCookieStore.get("stillframe_admin");
    expect(cookie.value).toBeDefined();
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("lax");

    const valid = await isAdminSession();
    expect(valid).toBe(true);
  });

  it("rejects session creation for an unauthorized email", async () => {
    const { createAdminSession } = await import("../lib/drive/session");
    await expect(createAdminSession("intruder@example.com")).rejects.toThrow(
      /not the configured gallery administrator/i
    );
  });

  it("rejects invalid or tampered session token signature", async () => {
    const { createAdminSession, isAdminSession } = await import("../lib/drive/session");
    await createAdminSession(adminEmail);

    const cookie = mockCookieStore.get("stillframe_admin");
    const [payload, sig] = cookie.value.split(".");

    // Alter the signature
    const tamperedSig = sig.slice(0, -2) + (sig.slice(-1) === "A" ? "B" : "A");
    mockCookieStore.set("stillframe_admin", { value: `${payload}.${tamperedSig}` });

    expect(await isAdminSession()).toBe(false);
  });

  it("rejects expired session tokens", async () => {
    const { isAdminSession } = await import("../lib/drive/session");
    const { createHmac } = await import("node:crypto");

    // Construct expired payload (exp in the past)
    const payload = Buffer.from(
      JSON.stringify({ email: adminEmail, exp: Date.now() - 10000 })
    ).toString("base64url");
    const sig = createHmac("sha256", authSecret).update(payload).digest("base64url");
    mockCookieStore.set("stillframe_admin", { value: `${payload}.${sig}` });

    expect(await isAdminSession()).toBe(false);
  });

  it("rejects session token with forged email in payload", async () => {
    const { isAdminSession } = await import("../lib/drive/session");
    const { createHmac } = await import("node:crypto");

    const payload = Buffer.from(
      JSON.stringify({ email: "other@gmail.com", exp: Date.now() + 100000 })
    ).toString("base64url");
    const sig = createHmac("sha256", authSecret).update(payload).digest("base64url");
    mockCookieStore.set("stillframe_admin", { value: `${payload}.${sig}` });

    expect(await isAdminSession()).toBe(false);
  });

  it("returns false when no session cookie is present", async () => {
    const { isAdminSession, isFamilySession, hasGalleryAccess } = await import("../lib/drive/session");
    expect(await isAdminSession()).toBe(false);
    expect(await isFamilySession()).toBe(false);
    expect(await hasGalleryAccess()).toBe(false);
  });

  it("creates and verifies a valid family session with correct passphrase", async () => {
    process.env.FAMILY_PASSPHRASE = "SecretFamilyPass2026!";
    const { createFamilySession, isFamilySession, hasGalleryAccess, isAdminSession } = await import("../lib/drive/session");
    await createFamilySession("SecretFamilyPass2026!");

    expect(mockCookieStore.has("stillframe_family")).toBe(true);
    expect(await isFamilySession()).toBe(true);
    expect(await hasGalleryAccess()).toBe(true);
    // Family session should NOT have admin role
    expect(await isAdminSession()).toBe(false);
  });

  it("rejects family session creation with incorrect passphrase", async () => {
    process.env.FAMILY_PASSPHRASE = "SecretFamilyPass2026!";
    const { createFamilySession } = await import("../lib/drive/session");
    await expect(createFamilySession("WrongPassphrase")).rejects.toThrow(/invalid family passphrase/i);
  });
});
