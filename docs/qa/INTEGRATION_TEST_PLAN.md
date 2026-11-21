# Integration Test Plan — Stillframe Gallery

This document outlines the systematic test cases and verification procedures required for the Stillframe photo gallery application across OAuth, Database, Drive API, and Image Proxy.

---

## 1. Test Matrix Overview

| Module | Verification Target | Test Method | Prerequisite |
|---|---|---|---|
| **Auth / OAuth** | State generation, cookie flags, CSRF prevention | Unit test / Mock HTTP | Mock cookies/fetch |
| **Auth / OAuth** | Account restriction (`ADMIN_EMAIL`) | Mock HTTP / Live test | Google identity token |
| **Database** | Migration / table bootstrap, token encryption roundtrip | Unit test + Live DB | `DATABASE_URL`, `TOKEN_ENCRYPTION_KEY` |
| **Drive Integration** | Recursive folder traversal (up to 500), pagination | Mock Drive API | Mock fetch responses |
| **Drive Integration** | MIME type filtering & query isolation | Unit tests (existing) | None |
| **Image Proxy** | Streaming image bytes, Cache-Control headers | Mock / Live test | Authenticated session |
| **Security** | Tampered session cookie, expired session, unauthorized API calls | Unit test / Integration test | `AUTH_SECRET` |

---

## 2. Detailed Test Cases

### Suite A: Cryptography & Session Management
- **TC-SEC-01: Encryption Roundtrip**: Verify AES-256-GCM encryption/decryption returns the exact plaintext for arbitrary string lengths.
- **TC-SEC-02: Encryption Tamper Resistance**: Modifying IV, auth tag, or ciphertext must immediately throw an error.
- **TC-SEC-03: Session Signing**: Ensure `isAdminSession` validates HMAC-SHA256 signature using timing-safe comparisons.
- **TC-SEC-04: Session Expiration**: Verify that sessions with timestamps older than 7 days fail verification.
- **TC-SEC-05: Non-Admin Email Rejection**: Ensure sessions crafted with an email differing from `ADMIN_EMAIL` fail verification.

### Suite B: Google OAuth Handshake (`/api/admin/drive/*`)
- **TC-OAUTH-01: Connect Redirect**: Verify `GET /api/admin/drive/connect` sets `stillframe_oauth_state` (httpOnly, sameSite=lax) and redirects to `accounts.google.com` with `prompt=consent select_account`.
- **TC-OAUTH-02: Missing or Mismatched State**: Callback with altered or missing `state` query parameter or missing cookie must return 400 Bad Request.
- **TC-OAUTH-03: Unauthorized Google Account**: Callback with an authenticated Google user whose email does not match `ADMIN_EMAIL` must return 403 Forbidden without saving tokens.
- **TC-OAUTH-04: Missing Refresh Token**: If Google does not return a refresh token (due to re-prompt omission), return 400 with user-actionable instructions.
- **TC-OAUTH-05: Successful Authorization**: Verify exchange stores encrypted token in DB, sets `stillframe_admin` cookie, and redirects to `/?drive=connected`.

### Suite C: Database Persistence (`lib/drive/store.ts`)
- **TC-DB-01: Auto-Provisioning**: Verify `saveRefreshToken` and `loadRefreshToken` idempotently bootstrap the `stillframe_secrets` table if it does not exist.
- **TC-DB-02: Key Conflict Upsert**: Re-authorizing Google Drive updates the existing `google_refresh_token` record with a new timestamp and ciphertext.
- **TC-DB-03: Connection Lifecycle**: Validate that serverless query pool cleanly acquires and releases connections without exhaustion (`max: 1`).

### Suite D: Google Drive API & Scoping (`lib/drive/google.ts` & `/api/gallery/photos`)
- **TC-DRV-01: Root Folder Restriction**: Verify query strictly targets `'${rootFolderId}' in parents and trashed = false`.
- **TC-DRV-02: Recursive Subfolder Traversal**: Queue subfolders and traverse up to 500 folders; handle multi-page token pagination.
- **TC-DRV-03: MIME Type Whitelisting**: Ensure non-image files (documents, videos, PDFs) inside traversed folders are discarded.
- **TC-DRV-04: Unauthorized Access**: Calling `GET /api/gallery/photos` without active `stillframe_admin` cookie returns 401 Unauthorized with `Cache-Control: no-store`.

### Suite E: Image Proxy (`/api/gallery/image/[fileId]`)
- **TC-IMG-01: Unauthorized Image Request**: Calling image route without admin session returns 401 Unauthorized.
- **TC-IMG-02: Path Traversal / Malformed File ID**: Supplying non-opaque or path-manipulated IDs returns 404 Not Found without hitting Drive API.
- **TC-IMG-03: Out-of-Scope File Access**: Attempting to fetch a file ID that exists in Drive but outside the configured root folder tree returns 404 Not Found.
- **TC-IMG-04: Streaming Headers**: Verify returned response contains `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`, and matching MIME type.
- **TC-IMG-05: Traversal Performance**: Identify latency overhead of re-invoking `listGalleryPhotos()` per image request.
