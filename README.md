# Stillframe — Web Gallery

A private, read-only family photo gallery backed by one administrator-selected Google Drive folder.

## Current milestone

This repository contains the initial Next.js application shell, the dark cinematic gallery experience, environment configuration, and tested Drive query-scope helpers. The live Drive connection and invitation-only authentication are intentionally not enabled yet; the app must not be deployed as a functioning private gallery until those security controls are implemented.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS v4
- Vitest for unit tests
- Google Drive API v3 integration (next milestone)
- Vercel deployment target

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

Run tests:

```bash
npm test
```

## Google Drive boundary

Set `GOOGLE_DRIVE_ROOT_FOLDER_ID` to the administrator-selected folder ID. The current configured folder is `1hY1TfUftj8WDHSOGoSR-dsPcrkZe33Ea`.

Drive listing must always be scoped to this server-side configured root. Do not accept a folder ID from the browser as the gallery root and do not enumerate the user's entire Drive. Only image MIME types should be returned. OAuth tokens and client secrets must remain server-side and must never use a `NEXT_PUBLIC_` prefix.

## Security / release gate

Before enabling real photos or deploying for family use, implement and verify:

1. Invitation-only family authentication and ADMIN / FAMILY_MEMBER roles.
2. Administrator-only Google Drive OAuth connection and folder selection.
3. Encrypted refresh-token storage and server-side token refresh.
4. Root-folder and descendant validation for every listed file and image request.
5. Authenticated image proxy endpoints with private cache controls.
6. Revocation checks and tests proving uninvited/revoked users cannot access gallery data.

The current UI is a frontend foundation, not a production-ready private gallery. Do not expose real family photos until the release gates above pass.
