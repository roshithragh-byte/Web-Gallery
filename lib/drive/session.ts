import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getDriveConfig } from "./config";
const COOKIE="stillframe_admin";
function signature(value:string,secret:string){return createHmac("sha256",secret).update(value).digest("base64url");}
export async function createAdminSession(email:string){
  const c=getDriveConfig(); if(email.toLowerCase()!==c.adminEmail) throw new Error("This Google account is not the configured gallery administrator.");
  const payload=Buffer.from(JSON.stringify({email,exp:Date.now()+7*24*60*60*1000})).toString("base64url");
  const token=payload+"."+signature(payload,c.authSecret);
  (await cookies()).set(COOKIE,token,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:7*24*60*60});
}
export async function isAdminSession(){
  const c=getDriveConfig(); const token=(await cookies()).get(COOKIE)?.value;
  if(!token)return false;
  const [payload,sig]=token.split("."); if(!payload||!sig)return false;
  const expected=Buffer.from(signature(payload,c.authSecret)); const actual=Buffer.from(sig);
  if(expected.length!==actual.length||!timingSafeEqual(expected,actual))return false;
  try{const data=JSON.parse(Buffer.from(payload,"base64url").toString());return data.email?.toLowerCase()===c.adminEmail&&data.exp>Date.now();}catch{return false;}
}
