import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getDriveConfig } from "@/lib/drive/config";
export const runtime="nodejs";
export async function GET(){
  const c=getDriveConfig(); const state=randomBytes(32).toString("base64url");
  (await cookies()).set("stillframe_oauth_state",state,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:600});
  const url=new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search=new URLSearchParams({client_id:c.clientId,redirect_uri:c.redirectUri,response_type:"code",scope:"openid email https://www.googleapis.com/auth/drive.readonly",access_type:"offline",prompt:"consent select_account",include_granted_scopes:"true",state}).toString();
  return Response.redirect(url);
}
