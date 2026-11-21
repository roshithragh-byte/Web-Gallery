import "server-only";
import { getDriveConfig } from "./config";
import { loadRefreshToken } from "./store";
import { buildGalleryQuery, isImageMimeType } from "./scope";
type DriveFile={id:string;name:string;mimeType:string;size?:string;modifiedTime?:string;thumbnailLink?:string;parents?:string[]};
async function accessToken(){
  const c=getDriveConfig(); const refresh=await loadRefreshToken(); if(!refresh)throw new Error("Google Drive is not connected. Connect the administrator account first.");
  const response=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:c.clientId,client_secret:c.clientSecret,refresh_token:refresh,grant_type:"refresh_token"}),cache:"no-store"});
  const data=await response.json(); if(!response.ok||!data.access_token)throw new Error("Google access token refresh failed.");
  return data.access_token as string;
}
async function driveGet(path:string,token:string,params?:Record<string,string>){
  const url=new URL("https://www.googleapis.com/drive/v3/"+path); Object.entries(params??{}).forEach(([k,v])=>url.searchParams.set(k,v));
  const r=await fetch(url,{headers:{Authorization:"Bearer "+token},cache:"no-store"}); if(!r.ok)throw new Error(`Google Drive request failed (${r.status}).`); return r;
}
export async function listGalleryPhotos(){
  const c=getDriveConfig(); const token=await accessToken(); const queue=[c.rootFolderId]; const seen=new Set<string>(); const photos:DriveFile[]=[];
  while(queue.length&&seen.size<500){
    const folder=queue.shift()!; if(seen.has(folder))continue; seen.add(folder);
    let pageToken:string|undefined;
    do{
      const q=buildGalleryQuery(folder);
      const params:Record<string,string>={q, pageSize:"100",fields:"nextPageToken,files(id,name,mimeType,size,modifiedTime,thumbnailLink,parents)",orderBy:"name"};
      if(pageToken)params.pageToken=pageToken;
      const result=await (await driveGet("files",token,params)).json();
      for(const f of (result.files??[]) as DriveFile[]){if(f.mimeType==="application/vnd.google-apps.folder"){queue.push(f.id);}else if(isImageMimeType(f.mimeType))photos.push(f);}
      pageToken=result.nextPageToken;
    }while(pageToken);
  }
  return photos;
}
export async function getGalleryImage(fileId:string){
  const photos=await listGalleryPhotos(); const file=photos.find((f)=>f.id===fileId); if(!file) return null;
  const token=await accessToken(); const response=await driveGet(`files/${encodeURIComponent(file.id)}`,token,{alt:"media"});
  return {body:await response.arrayBuffer(),mimeType:file.mimeType};
}
