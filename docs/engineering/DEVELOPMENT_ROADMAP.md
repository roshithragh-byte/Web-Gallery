# Development Roadmap — Stillframe Gallery

This roadmap defines the prioritized development phases for Stillframe following the technical takeover.

---

## Phase 1: Stabilization & Hardening (Current Priority)
*Goal: Ensure reliability, zero rate-limit thrashing, and robust automated test coverage before live deployment.*

1. **Add Security & Crypto Unit Tests**:
   - Create unit tests for `lib/drive/crypto.ts` (AES-256-GCM encryption, decryption, invalid ciphertext handling).
   - Create unit tests for `lib/drive/session.ts` (HMAC-SHA256 signature verification, timing safe equality, tampering rejection).
2. **Resolve Image Proxy Traversal Bottleneck (TD-01)**:
   - Eliminate N+1 Drive folder tree traversal inside `getGalleryImage(fileId)`.
   - Implement ancestor verification or cached photo manifest with short TTL.
3. **Stream Image Proxy Response (TD-03)**:
   - Stream `response.body` (Web Stream) directly in `app/api/gallery/image/[fileId]/route.ts` instead of `arrayBuffer()`, optimizing memory for high-resolution images.
4. **Fix ESLint / Next.js Config Warnings (TD-04)**:
   - Fix module export warning in `eslint.config.mjs`.

---

## Phase 2: Live Integration Verification
*Goal: Validate live OAuth, Neon PostgreSQL, and Google Drive access using administrator credentials.*

1. **Validate Local Development Setup**:
   - Populate `.env.local` with non-secret identifiers (`GOOGLE_CLIENT_ID`, `GOOGLE_REDIRECT_URI=http://localhost:3000/api/admin/drive/callback`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`, `ADMIN_EMAIL`).
   - Populate local database credentials and test OAuth consent screen.
2. **Execute Full Test Plan**:
   - Run test procedures defined in `docs/qa/INTEGRATION_TEST_PLAN.md`.
   - Verify token refresh cycle and database token persistence.

---

## Phase 3: Preview & Production Readiness
*Goal: Safe deployment to Vercel environments.*

1. **Configure Vercel Preview & Production Secrets**:
   - Ensure distinct, non-reused keys for `TOKEN_ENCRYPTION_KEY` and `AUTH_SECRET`.
   - Separate Neon database branches: `br-tiny-bird-bdq4bkhl` (Preview) vs `br-jolly-wind-bdkx404k` (Production).
   - Verify Google OAuth redirect URIs for each environment.
2. **Pull Request #1 Review**:
   - Provide final QA signoff on PR #1 once all integration tests succeed.

---

## Phase 4: Future Product Capabilities (Deferred)
*The following features are strictly out of scope for the current milestone and must not be implemented until Phase 1-3 are complete:*
- Family member authentication and invitation system.
- Family roles (viewer, contributor, admin).
- Albums, tag management, and photo search.
- Chronological timeline navigation.
- Lightbox and full-screen slideshow mode.
- Mobile touch gestures and offline progressive web app support.
