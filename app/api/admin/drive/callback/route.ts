import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { getDriveConfig } from "@/lib/drive/config";
import { saveRefreshToken } from "@/lib/drive/store";
import { createAdminSession } from "@/lib/drive/session";
export const runtime="nodejs";
export async function GET(request:Request){
  const url=new URL(request.url); const code=url.searchParams.get("code"); const state=url.searchParams.get("state"); const jar=await cookies(); const expected=jar.get("stillframe_oauth_state")?.value??"";
  jar.delete("stillframe_oauth_state");
  if(!code||!state||!expected||Buffer.byteLength(state)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(state),Buffer.from(expected)))return new Response("Invalid OAuth state.",{status:400});
  const c=getDriveConfig();
  const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:c.clientId,client_secret:c.clientSecret,redirect_uri:c.redirectUri,grant_type:"authorization_code"}),cache:"no-store"});
  const tokens=await tokenResponse.json(); if(!tokenResponse.ok||!tokens.access_token)return new Response("Google token exchange failed.",{status:400});
  const userResponse=await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{headers:{Authorization:"Bearer "+tokens.access_token},cache:"no-store"});
  const user=await userResponse.json(); if(!userResponse.ok||!user.verified_email||user.email?.toLowerCase()!==c.adminEmail)return new Response("Sign in with the configured administrator Google account.",{status:403});
  if(tokens.refresh_token)await saveRefreshToken(tokens.refresh_token);
  else if(!tokens.refresh_token)return new Response("Google did not return a refresh token. Revoke the previous Stillframe grant in your Google Account and try Connect again.",{status:400});
  await createAdminSession(user.email);
  return Response.redirect(new URL("/?drive=connected",request.url));
}
