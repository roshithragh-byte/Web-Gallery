# Technical Debt & Architecture Audit — Stillframe Gallery

This document catalogs technical debt, architectural bottlenecks, and security considerations identified during the technical takeover of Stillframe.

---

## 1. High-Priority Architectural Bottlenecks

### TD-01: Full Drive Traversal on Every Image Request (Critical Performance Bottleneck)
- **Location**: `lib/drive/google.ts` (`getGalleryImage` function)
  ```typescript
  export async function getGalleryImage(fileId: string) {
    const photos = await listGalleryPhotos();
    const file = photos.find((f) => f.id === fileId);
    if (!file) return null;
    const token = await accessToken();
    const response = await driveGet(`files/${encodeURIComponent(file.id)}`, token, { alt: "media" });
    return { body: await response.arrayBuffer(), mimeType: file.mimeType };
  }
  ```
- **Impact**: When the gallery page loads 30 images, each image request (`/api/gallery/image/[fileId]`) independently triggers `listGalleryPhotos()`, initiating up to 500 Google Drive API calls *per image* (30 × 500 = 15,000 API requests). This will instantly exhaust Google Drive API rate limits (12,000 queries/minute) and cause 10-30s latencies or 502/503 timeouts on Vercel serverless functions.
- **Root Cause**: The developer sought to verify that `fileId` is strictly inside the permitted folder tree before streaming bytes, which is a commendable security practice. However, doing a full un-cached traversal on every single thumbnail/image request creates severe N+1 traversal latency.
- **Remediation**:
  1. In-memory / short-lived serverless cache for the verified file ID set or folder structure, OR
  2. Query Google Drive API for the specific file metadata with parent check (`fields: 'id,mimeType,parents'`) and verify its ancestor lineage, OR
  3. Cache the photo manifest in the PostgreSQL database or Next.js cache layer with a short TTL (e.g., 5-15 minutes).

### TD-02: Missing Unit Test Coverage for Security & Crypto Primitives
- **Location**: `lib/drive/crypto.ts`, `lib/drive/session.ts`
- **Impact**: Currently only `tests/drive-scope.test.ts` exists. The core crypto routines (AES-256-GCM encryption/decryption, HMAC-SHA256 session signing, constant-time comparisons) have 0% automated test coverage.
- **Remediation**: Create `tests/crypto.test.ts` and `tests/session.test.ts` to guarantee tamper detection, key derivation, and session signature validation.

---

## 2. Moderate Technical Debt

### TD-03: ArrayBuffer Buffering for Large Photos
- **Location**: `lib/drive/google.ts` and `/api/gallery/image/[fileId]/route.ts`
  ```typescript
  return { body: await response.arrayBuffer(), mimeType: file.mimeType };
  ```
- **Impact**: Reading the complete file into memory via `await response.arrayBuffer()` consumes substantial serverless memory if users store 20MB-50MB RAW/high-res JPEG images. Serverless functions on Vercel typically have 1024MB memory limits.
- **Remediation**: Stream the `response.body` (ReadableStream) directly into `new Response(response.body, ...)` instead of buffering full buffers in Node.js memory.

### TD-04: Next.js ESLint Warnings
- **Location**:
  - `components/gallery-photos.tsx:14` (`@next/next/no-img-element` warning)
  - `eslint.config.mjs:9` (`import/no-anonymous-default-export` warning)
- **Impact**: Non-blocking build warnings, but standardizes best practices for Next.js image loading and module naming.
- **Remediation**: Assign default config to variable in `eslint.config.mjs`. In `gallery-photos.tsx`, keep standard `<img>` or evaluate Next.js `<Image />` once custom loader requirements are defined.

---

## 3. Low-Risk Cleanups

### TD-05: Absence of Automated OAuth & DB Integration Mocks
- **Location**: `tests/`
- **Impact**: Without mocking `fetch` for Google endpoints and mocking `postgres`, baseline tests cannot run integration passes without live internet and credentials.
- **Remediation**: Add unit mock tests for route handlers using Vitest mocks.
