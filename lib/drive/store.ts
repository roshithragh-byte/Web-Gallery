import "server-only";
import postgres from "postgres";
import { decryptSecret, encryptSecret } from "./crypto";
import { getDriveConfig } from "./config";
let sql: ReturnType<typeof postgres> | undefined;
function db(){ const c=getDriveConfig(); return sql ??= postgres(c.databaseUrl,{max:1,prepare:false,ssl:"require"}); }
export async function saveRefreshToken(token:string){
  const c=getDriveConfig(); const encrypted=encryptSecret(token,c.encryptionKey);
  await db()`CREATE TABLE IF NOT EXISTS stillframe_secrets (key text PRIMARY KEY, value text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
  await db()`INSERT INTO stillframe_secrets(key,value) VALUES ('google_refresh_token',${encrypted}) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`;
}
export async function loadRefreshToken(){
  const c=getDriveConfig();
  await db()`CREATE TABLE IF NOT EXISTS stillframe_secrets (key text PRIMARY KEY, value text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
  const rows=await db()`SELECT value FROM stillframe_secrets WHERE key='google_refresh_token' LIMIT 1`;
  return rows[0] ? decryptSecret(rows[0].value,c.encryptionKey) : null;
}
