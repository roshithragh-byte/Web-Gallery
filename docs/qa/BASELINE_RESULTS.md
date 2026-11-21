# Baseline Verification Results — Stillframe Gallery

**Verification Date**: 2026-11-22  
**Branch**: `feat/google-drive-gallery`  
**Base Commit**: `fe1a034`  
**Environment**: Local Linux Development Environment (Node.js v20+, npm 10+, Neon PostgreSQL, Google Drive API)

---

## 1. Verified Test Matrix

| Validation Area | Command / Check | Result | Evidence / Notes |
|---|---|---|---|
| **Dependency Installation** | `npm install` | **VERIFIED WORKING** | 373 packages added, 380 audited, 0 install errors. |
| **ESLint Static Analysis** | `npm run lint` | **VERIFIED WORKING** | 0 errors, 1 warning (`@next/next/no-img-element` in `gallery-photos.tsx`). Anonymous export warning resolved. |
| **Unit Tests** | `npm test` (`vitest run`) | **VERIFIED WORKING** | 3 test files, 16 unit tests passed in 331ms. Full coverage for Drive query scoping, AES-256-GCM crypto primitives, and HMAC-SHA256 session token management. |
| **TypeScript Type Checking** | Part of `next build` / `tsc` | **VERIFIED WORKING** | Zero type errors across all API routes, React components, and utility modules. |
| **Production Build** | `npm run build` (`next build`) | **VERIFIED WORKING** | Successfully compiled all static pages and dynamic serverless routes. |
| **Database Connection & Bootstrap** | Neon PostgreSQL (`postgres` driver) | **VERIFIED WORKING** | Direct SSL connection verified. Table `stillframe_secrets` cleanly provisioned and schema verified. |
| **Encrypted Token Persistence** | `stillframe_secrets` (AES-256-GCM) | **VERIFIED WORKING** | Refresh token encrypted, stored, and decrypted successfully with `TOKEN_ENCRYPTION_KEY`. |
| **Google OAuth Access Token Refresh** | `https://oauth2.googleapis.com/token` | **VERIFIED WORKING** | Refresh token exchange returns valid `access_token`. |
| **Google Drive Scope & Listing** | `/api/gallery/photos` | **VERIFIED WORKING** | Root folder `1hY1TfUftj8WDHSOGoSR-dsPcrkZe33Ea` ("Channdduus") read; **96 family photographs** identified and listed with metadata. |
| **Image Proxy Streaming** | `/api/gallery/image/[fileId]` | **VERIFIED WORKING** | Direct streaming verified via HTTP 200 with `Content-Type: image/jpeg`, `Cache-Control: private, no-store`, streaming 153,309 bytes on test sample. |
| **Traversal Performance & Memory** | `lib/drive/google.ts` cache & stream | **VERIFIED WORKING** | In-memory photo manifest cache and Web ReadableStream proxy active; zero N+1 Drive folder traversal thrashing. |

---

## 2. Command Execution Evidence

### A. Vitest Suite
```text
 ✓ tests/drive-scope.test.ts (4 tests) 3ms
 ✓ tests/crypto.test.ts (6 tests) 5ms
 ✓ tests/session.test.ts (6 tests) 30ms

 Test Files  3 passed (3)
      Tests  16 passed (16)
   Duration  331ms
```

### B. Live End-to-End API Verification
```text
Photos API HTTP code: 200
Photos count returned from API: 96
Testing image proxy for first photo: 1uN8eypFaD8vzPAKkmbqjHg0li-jBFR8j IMG-20261121-WA0028.jpg /api/gallery/image/1uN8eypFaD8vzPAKkmbqjHg0li-jBFR8j
Image proxy HTTP code: 200
Content-Type header: image/jpeg
Cache-Control header: private, no-store
Streamed image bytes length: 153309
```
