/** Drive query helpers: root IDs must come from trusted server configuration. */
export function isSafeDriveFileId(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{10,}$/.test(value);
}
export function buildGalleryQuery(rootFolderId: string): string {
  const id = rootFolderId.trim();
  if (!id) throw new Error("Google Drive gallery root folder ID is not configured.");
  if (!isSafeDriveFileId(id)) throw new Error("Google Drive gallery root folder ID is invalid.");
  return `'${id}' in parents and trashed = false`;
}
export function isImageMimeType(mimeType: string | null | undefined): boolean {
  return typeof mimeType === "string" && /^image\/(jpeg|png|webp|gif|heic|heif|avif|bmp|tiff?)$/i.test(mimeType);
}
