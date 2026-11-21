# Implementation Inventory — Stillframe Gallery

| Capability / Feature | Source Files | Test Files | Status | Notes |
|---|---|---|---|---|
| **Configuration Loading** | `lib/drive/config.ts` | Implicit in tests | **VERIFIED WORKING** | Validates presence of 8 required env vars; normalizes email to lowercase. |
| **AES-256-GCM Encryption** | `lib/drive/crypto.ts` | `tests/crypto.test.ts` | **VERIFIED WORKING** | Verified via unit tests (roundtrip, IV randomness, malformed handling, tamper rejection). |
| **Admin Session Cookie** | `lib/drive/session.ts` | `tests/session.test.ts` | **VERIFIED WORKING** | Verified via unit tests (HMAC-SHA256, 7-day TTL, `httpOnly`, timing-safe comparisons). |
| **Database Token Store** | `lib/drive/store.ts` | Live integration probe | **VERIFIED WORKING** | Verified live on Neon PostgreSQL. `stillframe_secrets` created, encrypted token stored and retrieved. |
| **Drive Query Scoping** | `lib/drive/scope.ts` | `tests/drive-scope.test.ts` | **VERIFIED WORKING** | Verified safe opaque ID, MIME whitelist, and parent folder query formatting. |
| **OAuth Initiation** | `app/api/admin/drive/connect/route.ts` | Live HTTP probe | **VERIFIED WORKING** | Sets 32-byte CSRF cookie (`stillframe_oauth_state`), redirects to Google OAuth with required scopes. |
| **OAuth Callback Handler** | `app/api/admin/drive/callback/route.ts` | Live HTTP probe | **VERIFIED WORKING** | Timing-safe state check, token exchange, `ADMIN_EMAIL` check, encrypted DB persistence. |
| **Drive Traversal & Fetch** | `lib/drive/google.ts` | Live API probe | **VERIFIED WORKING** | Scans root folder `1hY1TfUftj8WDHSOGoSR-dsPcrkZe33Ea`, parses subfolders, in-memory cache active. |
| **Photo Listing API** | `app/api/gallery/photos/route.ts` | Live API probe | **VERIFIED WORKING** | Verified live. Returns HTTP 200 with 96 family photographs and `private, no-store` headers. |
| **Image Proxy Stream API** | `app/api/gallery/image/[fileId]/route.ts` | Live API probe | **VERIFIED WORKING** | Verified live. Streams raw bytes via Web Stream with `image/jpeg` content type and security headers. |
| **Gallery UI / Grid** | `app/page.tsx`, `components/gallery-photos.tsx` | Visual / Lint / Build | **VERIFIED WORKING** | Responsive grid, loads photos from `/api/gallery/photos`, lazy-loading image tiles. |
| **Theme & Styling** | `app/globals.css` | Visual / Build | **VERIFIED WORKING** | Dark aesthetic, CSS variables, custom typography, responsive breakpoints. |
| **Family Auth & Sharing** | None | None | **NOT IMPLEMENTED** | Out of scope for current milestone; strictly reserved for future roadmap. |
