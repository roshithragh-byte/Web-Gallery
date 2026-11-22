import "server-only";
export function getDriveConfig() {
  const required = ["GOOGLE_CLIENT_ID","GOOGLE_CLIENT_SECRET","GOOGLE_REDIRECT_URI","GOOGLE_DRIVE_ROOT_FOLDER_ID","DATABASE_URL","TOKEN_ENCRYPTION_KEY","AUTH_SECRET","ADMIN_EMAIL"] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing server configuration: ${missing.join(", ")}`);
  return {
    clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!, rootFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!,
    databaseUrl: process.env.DATABASE_URL!, encryptionKey: process.env.TOKEN_ENCRYPTION_KEY!,
    authSecret: process.env.AUTH_SECRET!, adminEmail: process.env.ADMIN_EMAIL!.toLowerCase(),
    familyPassphrase: process.env.FAMILY_PASSPHRASE || "",
  };
}
