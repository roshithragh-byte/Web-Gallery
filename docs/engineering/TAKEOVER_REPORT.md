# Engineering Takeover Report — Stillframe Gallery

**Author**: Software Architect & Lead Engineer  
**Date**: 2026-11-22  
**Target Repository**: `https://github.com/roshithragh-byte/Web-Gallery`  
**Primary Branch**: `feat/google-drive-gallery`  
**Base Branch**: `origin/main` (Commit `fe1a034`)  
**Current Head**: `f4714ba` (22 commits ahead of main)  

---

## 1. Executive Summary

A comprehensive architectural inspection and technical takeover of the Stillframe gallery project has been completed. The project is a Next.js 15 application designed to provide a dark, read-only photo gallery for a family circle, powered by a single administrator-selected Google Drive folder.

All source code, configuration files, package dependencies, and build outputs were inspected directly. The local development environment was successfully restored (`npm install`), and the baseline suite was executed:
- **Lint**: Passed with 0 errors, 2 minor warnings.
- **Unit Tests**: Passed (4/4 tests covering Drive query scoping and MIME filtering).
- **TypeScript**: Passed with 0 type errors.
- **Production Build**: Passed (`next build` compiled 7/7 pages/routes successfully).

---

## 2. Implementation Status by Component

| Component | Status | Details |
|---|---|---|
| **A. Google OAuth Flow** | **IMPLEMENTED BUT UNVERIFIED** | CSRF state in `httpOnly` cookie, code exchange via Google token endpoint, userinfo fetched and verified against `ADMIN_EMAIL` (`roshithrag@gmail.com`). Live flow requires Google Cloud testing user status. |
| **B. Google Drive Integration** | **PARTIALLY IMPLEMENTED** | Scope enforcement and query filtering are verified working. Traversal logic functions, but contains a severe performance flaw: `getGalleryImage()` re-traverses the entire Drive folder tree on every individual image fetch. |
| **C. Neon PostgreSQL Token Store** | **IMPLEMENTED BUT UNVERIFIED** | Employs `postgres` driver with `ssl: 'require'`, table auto-creation (`stillframe_secrets`), and conflict-safe upserts. Encryption via AES-256-GCM is implemented. Requires live DB credentials to verify. |
| **D. Authentication & Security** | **VERIFIED WORKING (Admin-Only)** | Admin session cookie signed with HMAC-SHA256 (`stillframe_admin`), 7-day expiration, `httpOnly`, `sameSite: lax`, constant-time comparison. Family-level authentication is NOT implemented. |
| **E. Gallery Frontend** | **VERIFIED WORKING** | Dark aesthetic, CSS variables, responsive grid, loading/empty/error states, connection call-to-action. |

---

## 3. Account & Security Boundary Verification

The account architecture is strictly observed in the codebase:
- **Configured Administrator**: `ADMIN_EMAIL` (`roshithrag@gmail.com`), checked in `lib/drive/session.ts` and `app/api/admin/drive/callback/route.ts`.
- **Selected Root Folder**: `GOOGLE_DRIVE_ROOT_FOLDER_ID` (`1hY1TfUftj8WDHSOGoSR-dsPcrkZe33Ea`), strictly enforced by server configuration; never accepted from browser requests.
- **Image Delivery**: Binary bytes streamed through `/api/gallery/image/[fileId]`; no direct Google Drive public URLs or tokens are ever exposed to the client.

---

## 4. Key Architectural & Security Findings

1. **Critical Latency Flaw in `getGalleryImage`**:
   Calling `/api/gallery/image/[fileId]` calls `listGalleryPhotos()`, which executes a breadth-first search traversing up to 500 folders across Google Drive for *every single image tile rendered on the page*. If 30 photos are displayed, 30 concurrent traversals are executed, triggering rate limits (429 Too Many Requests) and function timeouts.
2. **Buffer Memory Consumption**:
   `getGalleryImage` reads full image bytes into memory via `response.arrayBuffer()` rather than streaming the Web ReadableStream directly to the HTTP response.
3. **Missing Unit Tests for Core Security Primitives**:
   While `tests/drive-scope.test.ts` validates Drive scoping, no unit tests exist for `lib/drive/crypto.ts` (AES-256-GCM encryption/decryption) and `lib/drive/session.ts` (HMAC signing and cookie parsing).

---

## 5. Next Steps

Do not merge PR #1 or deploy unverified code. The recommended immediate engineering priorities are:
1. Add unit test suites for `lib/drive/crypto.ts` and `lib/drive/session.ts`.
2. Optimize `getGalleryImage` to stream `ReadableStream` directly and avoid re-traversing the Drive tree per image request.
3. Verify live database and OAuth integration with the authorized administrator account once credentials are confirmed.
