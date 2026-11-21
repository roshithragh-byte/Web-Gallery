import { isSafeDriveFileId } from "@/lib/drive/scope";
import { isAdminSession } from "@/lib/drive/session";
import { getGalleryImage } from "@/lib/drive/google";
export const runtime="nodejs";
export async function GET(_request:Request,context:{params:Promise<{fileId:string}>}){
  if(!await isAdminSession())return new Response("Unauthorized",{status:401,headers:{"Cache-Control":"no-store"}});
  const {fileId}=await context.params; if(!isSafeDriveFileId(fileId))return new Response("Not found",{status:404});
  try{
    const image=await getGalleryImage(fileId);
    if(!image||!image.stream)return new Response("Not found",{status:404,headers:{"Cache-Control":"no-store"}});
    return new Response(image.stream,{headers:{"Content-Type":image.mimeType,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Disposition":"inline"}});
  }catch{return new Response("Unable to retrieve image.",{status:502,headers:{"Cache-Control":"no-store"}});}
}
