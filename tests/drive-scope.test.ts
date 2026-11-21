import { describe, expect, it } from "vitest";
import { buildGalleryQuery, isImageMimeType, isSafeDriveFileId } from "../lib/drive/scope";
describe("Drive scope", () => {
  it("limits listing to a trusted parent folder", () => expect(buildGalleryQuery("folder_123-ABC")).toBe("'folder_123-ABC' in parents and trashed = false"));
  it("rejects empty or query-injected folder IDs", () => { expect(() => buildGalleryQuery(" ")).toThrow(/not configured/i); expect(() => buildGalleryQuery("x' or trashed=false")).toThrow(/invalid/i); });
  it("accepts image MIME types only", () => { expect(isImageMimeType("image/jpeg")).toBe(true); expect(isImageMimeType("image/webp")).toBe(true); expect(isImageMimeType("application/pdf")).toBe(false); expect(isImageMimeType(undefined)).toBe(false); });
  it("validates opaque Drive IDs", () => { expect(isSafeDriveFileId("1hY1TfUftj8WDHSOGoSR-dsPcrkZe33Ea")).toBe(true); expect(isSafeDriveFileId("../secrets")).toBe(false); expect(isSafeDriveFileId("")).toBe(false); });
});
