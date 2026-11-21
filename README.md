# Stillframe — Web Gallery

A dark, read-only photo gallery backed by one administrator-selected Google Drive folder.

## Current implementation status

This branch contains the administrator-only Google Drive integration milestone:

- Google OAuth web-server flow with state validation.
- Administrator identity checked against `ADMIN_EMAIL`.
- Refresh token encrypted with AES-256-GCM and persisted in PostgreSQL.
- Recursive traversal of the configured Drive root and child folders (up to 500 folders).
- Image MIME-type filtering and server-side image proxy.
- No browser-supplied root folder IDs and no public Drive URLs.
- Gallery listing and image routes require the signed administrator session cookie.

**Family access is not implemented yet.** The current gallery is administrator-only; do not treat it as a finished family release.

## Account separation

The services intentionally use different accounts:

| Service / role | Account |
|---|---|
| Google Cloud project and OAuth client owner | `roshithrag@gmail.com` |
| Google account that authorizes Drive access | `roshithrag@gmail.com` |
| Original Drive folder owner | `roshithragh@gmail.com` |
| GitHub repository and Vercel project operator | `roshithragh@gmail.com` |

The Drive folder is owned by `roshithragh@gmail.com` and must be shared with `roshithrag@gmail.com`. The latter account is the configured administrator (`ADMIN_EMAIL`) and the account that must complete OAuth consent.

## Clone and run locally

Requirements: Node.js 20 or newer, npm, and access to the Neon PostgreSQL database.

```bash
git clone --branch feat/google-drive-gallery https://github.com/roshithragh-byte/Web-Gallery.git
cd Web-Gallery
npm install
cp .env.example .env.local
```

Fill in `.env.local` with the values described below. Never commit `.env.local`.

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Environment variables

Set these in local `.env.local` and in the corresponding Vercel environment:

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google Cloud Web OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Web OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Exact callback URL for the environment |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Selected shared folder ID; never a whole-Drive listing |
| `DATABASE_URL` | Neon PostgreSQL connection string (TLS) |
| `TOKEN_ENCRYPTION_KEY` | Independent random key for AES-256-GCM token encryption |
| `AUTH_SECRET` | Separate random secret for administrator session signing |
| `ADMIN_EMAIL` | Exact Google account permitted to connect Drive |

For local development, set:

```env
GOOGLE_REDIRECT_URI=http://localhost:3000/api/admin/drive/callback
```

Add that exact URL to the Google OAuth Web Client's **Authorized redirect URIs**. The production callback is separate:

```text
https://stillframe-gallery.vercel.app/api/admin/drive/callback
```

Preview deployments also need their own exact callback URL registered in Google Cloud and configured in the Preview environment. Do not assume a Preview callback is interchangeable with localhost or Production.

Generate two independent secrets:

```bash
openssl rand -base64 32
openssl rand -base64 32
```

Use one for `TOKEN_ENCRYPTION_KEY` and the other for `AUTH_SECRET`. Do not reuse the OAuth client secret. Never commit actual credentials, tokens, or database URLs.

## Google Cloud setup

1. Use the Google Cloud project that owns the OAuth Web Client.
2. Enable the Google Drive API.
3. Configure the OAuth consent screen and add `roshithrag@gmail.com` as a test user while the app is in Testing.
4. Add the exact redirect URI for each environment (local, Preview, Production) to the OAuth Web Client.
5. Use the Web Client ID and secret from that same Google Cloud project in all environments.

The app requests `openid`, `email`, and `https://www.googleapis.com/auth/drive.readonly`. Google may require additional consent-screen configuration or verification for Drive scopes before broader distribution.

## Database

The app uses PostgreSQL through the `postgres` driver. It creates the `stillframe_secrets` table when the token store initializes. Use the isolated Neon Preview branch for Preview deployments and the Production branch only for Production. Never put database credentials in browser-side variables.

## Connect and verify

1. Configure all required environment variables.
2. Visit `/api/admin/drive/connect`.
3. Sign in as `ADMIN_EMAIL` (`roshithrag@gmail.com`).
4. Complete Google consent using the account that has access to the shared folder.
5. The callback validates OAuth state and administrator identity, then encrypts and stores the refresh token.
6. The home page requests `/api/gallery/photos`; image bytes are streamed through `/api/gallery/image/[fileId]`.

The root folder ID is server configuration. The backend traverses only that folder and its descendants; it does not list the administrator's entire Drive. Image bytes are streamed through authenticated routes with private no-store caching.

## Validation commands

```bash
npm run lint
npm test
npm run build
```

A PostgreSQL database and all required environment variables are needed for complete integration testing. Successful compilation alone does not prove that OAuth, database persistence, Drive listing, or image streaming work end to end.

## Security status / limitations

- Administrator-only access is implemented; invitation-based family authentication, family roles, and family user management are not implemented.
- Keep the GitHub pull request open until lint, tests, build, OAuth, PostgreSQL persistence, selected-folder listing, and authenticated image proxy checks pass.
- Never commit `.env.local`, OAuth secrets, refresh tokens, session secrets, or database connection strings.
