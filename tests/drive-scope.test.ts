import { describe, expect, it } from "vitest";
import { buildGalleryQuery, isImageMimeType } from "../lib/drive/scope";

describe("buildGalleryQuery", () => {
  it("limits Drive listing to the configured root folder", () => {
    expect(buildGalleryQuery("folder_123-ABC")).toBe(
      "'folder_123-ABC' in parents and trashed = false",
    );
  });

  it("trims whitespace around a configured folder ID", () => {
    expect(buildGalleryQuery("  folder123  ")).toBe(
      "'folder123' in parents and trashed = false",
    );
  });

  it("rejects an empty root folder ID", () => {
    expect(() => buildGalleryQuery("  ")).toThrow(/not configured/i);
  });

  it("rejects query syntax in the root folder ID", () => {
    expect(() => buildGalleryQuery("folder' or trashed = false")).toThrow(/invalid/i);
  });
});

describe("isImageMimeType", () => {
  it("accepts image MIME types", () => {
    expect(isImageMimeType("image/jpeg")).toBe(true);
    expect(isImageMimeType("image/webp")).toBe(true);
  });

  it("rejects non-image and missing MIME types", () => {
    expect(isImageMimeType("application/pdf")).toBe(false);
    expect(isImageMimeType(undefined)).toBe(false);
    expect(isImageMimeType(null)).toBe(false);
  });
});
