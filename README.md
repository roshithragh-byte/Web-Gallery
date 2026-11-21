# Stillframe — Web Gallery

A dark, read-only photo gallery backed by one administrator-selected Google Drive folder.

## Drive integration in this branch

- Server-side Google OAuth web-server flow with state validation.
- Administrator identity checked against `ADMIN_EMAIL`.
- Refresh token encrypted with AES-256-GCM and persisted in PostgreSQL.
- Recursive traversal of the configured Drive root and child folders (up to 500 folders).
- Image MIME-type filtering and server-side image proxy.
- No browser-supplied root folder IDs and no public Drive URLs.
- Gallery listing and image routes require the signed administrator session cookie.

## Required Vercel environment variables

Set all values for Production (and Preview only if you intentionally use a separate test OAuth client):

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Web OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Web OAuth client secret |
| `GOOGLE_REDIRECT_URI` | `https://stillframe-gallery.vercel.app/api/admin/drive/callback` |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Selected shared folder ID |
| `DATABASE_URL` | PostgreSQL connection string (TLS enabled) |
| `TOKEN_ENCRYPTION_KEY` | Long random secret used to encrypt the Drive refresh token |
| `AUTH_SECRET` | Separate long random secret used to sign the admin session |
| `ADMIN_EMAIL` | Exact Google account email authorized to connect Drive |

Generate two independent secrets (do not reuse the OAuth client secret):

```bash
openssl rand -base64 32
openssl rand -base64 32
```

Put the first in `TOKEN_ENCRYPTION_KEY` and the second in `AUTH_SECRET`. Never commit actual secrets.

## Google Cloud OAuth setup

Add this exact Authorized redirect URI to the web OAuth client:

```
https://stillframe-gallery.vercel.app/api/admin/drive/callback
```

The app requests `openid`, `email`, and `https://www.googleapis.com/auth/drive.readonly`. The Drive grant is used only by the server. The OAuth consent screen must include the administrator as an allowed user if Google project settings require it. Google may require verification for restricted Drive scopes.

## Database

The app creates a small `stillframe_secrets` table on first token save/read. Use a managed PostgreSQL database (for example Neon or Vercel Postgres) and set its TLS connection string as `DATABASE_URL`. Do not use a client-side database credential.

## Connect and verify

1. Deploy this branch after configuring the required environment variables.
2. Visit `/api/admin/drive/connect` while signed in as the configured `ADMIN_EMAIL`.
3. Complete Google consent using the Google account to which the photo folder was shared.
4. The callback validates OAuth state and administrator identity, then encrypts and stores the refresh token.
5. Return to the home page. The gallery calls `/api/gallery/photos`; images are streamed through `/api/gallery/image/[fileId]`.

## Security status / limitations

**This branch is an administrator-only integration milestone, not yet the finished family release.** The gallery API and image proxy currently require the administrator session. Invitation-based family authentication, family roles, and user management are not implemented yet. Do not share the deployment with family members as a production family gallery until those controls are added and tested.

The root folder ID is server configuration. The backend traverses only that folder and descendants; it never lists the administrator's whole Drive. Image bytes are streamed from Drive through authenticated routes with private no-store caching.

## Development

```bash
npm install
npm run dev
npm test
npm run build
``

A PostgreSQL database and the environment variables above are required to exercise the complete OAuth flow.
