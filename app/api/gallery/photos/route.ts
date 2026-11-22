import { hasGalleryAccess } from "@/lib/drive/session";
import { listGalleryPhotos } from "@/lib/drive/google";
export const runtime="nodejs";
export async function GET(){
  if(!await hasGalleryAccess())return Response.json({error:"Unauthorized"},{status:401,headers:{"Cache-Control":"no-store"}});
  try{const photos=await listGalleryPhotos();return Response.json({photos:photos.map(f=>({id:f.id,name:f.name,mimeType:f.mimeType,size:f.size??null,modifiedTime:f.modifiedTime??null,url:`/api/gallery/image/${encodeURIComponent(f.id)}`}))},{headers:{"Cache-Control":"private, no-store"}});}
  catch(e){return Response.json({error:e instanceof Error?e.message:"Unable to load gallery."},{status:503,headers:{"Cache-Control":"no-store"}});}
}
