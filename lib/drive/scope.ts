/**
 * Build the Drive API query for direct children of the configured gallery root.
 * The root folder ID must come from trusted server configuration, never a request.
 */
export function buildGalleryQuery(rootFolderId: string): string {
  const normalizedId = rootFolderId.trim();
  if (!normalizedId) {
    throw new Error("Google Drive gallery root folder ID is not configured.");
  }

  // Drive IDs are URL-safe opaque identifiers. Reject query syntax rather than
  // allowing a caller-controlled value to alter the Drive search expression.
  if (!/^[a-zA-Z0-9_-]+$/.test(normalizedId)) {
    throw new Error("Google Drive gallery root folder ID is invalid.");
  }

  return `'${normalizedId}' in parents and trashed = false`;
}

export function isImageMimeType(mimeType: string | null | undefined): boolean {
  return typeof mimeType === "string" && mimeType.startsWith("image/");
}
