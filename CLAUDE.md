# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Aidvocate: an emergency-relief request system for Cebu, Philippines. Residents submit help requests (web form or Facebook Messenger bot) that appear on a Leaflet map; verified responders update request status; admins verify requests/responders and manage ashfall reports and volcano advisories.

Two independent npm projects — no root package.json, no workspace tooling. Run commands from inside `backend/` or `frontend/`.

> The top-level `Readme.md` is partly stale: it describes an older file layout and mentions Prisma/PostgreSQL. The backend actually uses **MongoDB via Mongoose**; the `db:*` Prisma scripts in `backend/package.json` are leftovers and there is no Prisma schema.

## Commands

Backend (`backend/`):
- `npm run dev` — ts-node-dev with `--transpile-only` (type errors do NOT stop the dev server)
- `npm run build` — `tsc` to `dist/` (use this to actually type-check)
- `npm start` — run `dist/server.js`

Frontend (`frontend/`):
- `npm run dev` — Vite dev server; proxies `/api` to `http://localhost:5000`
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint

There is no test suite in either project.

## Environment

Backend `.env`: `MONGO_URI`, `JWT_SECRET`, `PORT` (default 5000), `CLIENT_URL` (CORS origin), `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`, `FB_PAGE_ACCESS_TOKEN`, `FB_VERIFY_TOKEN`, `FB_WEBHOOK_SECRET`. The server exits if Mongo fails to connect; missing `FB_PAGE_ACCESS_TOKEN` only logs a warning (bot init is wrapped in try/catch).

Frontend `.env`: `VITE_API_URL` (e.g. `http://localhost:5000/api`, includes the `/api` prefix), `VITE_AWS_BASE_URL` (used to build public S3 image URLs).

## Backend architecture (`backend/src`)

Express 5 + Mongoose, layered as `routes/ → controllers/ → models/`, with `services/` used mainly by the Messenger bot. All routes mount under `/api` in `server.ts`:
- `/api/emergencies` — public GET/POST; `PUT /:id` requires role `respondent`. Status changes trigger Messenger notifications to the original submitter (if `messengerUserId` is set).
- `/api/admin/*` — every route uses `authenticate, checkRole("admin")`; covers responder approval, emergency verify/unverify/delete, ashfall report status, volcano advisories.
- `/api/auth` — register (multipart, with `verificationDocument` upload), login, `GET /validate`.
- `/api/ashfall` — public ashfall reports + active volcano advisory.
- `/api/files/presign` — authenticated presigned GET URLs for private S3 objects.
- `/api/bot/webhook` — Facebook Messenger webhook.
- `/api/relief-distribution` (`relief.route.ts`) — scrapes PHIVOLCS (falls back to USGS), computes affected Cebu municipalities by distance/magnitude; in-memory 2-minute cache. `earthquake.route.ts` exists but is not mounted.

Auth: JWT in `Authorization: Bearer`. `authenticate` re-loads the user from Mongo and rejects unverified accounts (403 `ACCOUNT_NOT_VERIFIED`); `req.user` is typed via `types/express/index.d.ts`. Roles are `respondent` and `admin`.

Uploads (`utils/s3Uploads.ts`): `multer-s3`, 5MB, PDF/JPEG/PNG only. `publicUpload` stores under `public/` (emergency images, shown via `VITE_AWS_BASE_URL`); `privateUpload` stores at bucket root (responder verification docs, read through presigned URLs). Upload routes use `createUploadLimiter()` — 1 request per IP per 12 hours, which is easy to hit during local testing.

Messenger bot: `bot.controller` → `conversation.service` (step-by-step intake state machine) → `bot-emergency.service` (geocodes the place text and saves an `Emergency`) / `bot-notification.service` (pushes status updates) / `messenger.service` (Graph API calls). `session.service` keeps sessions and a 24h submission cooldown **in memory** — lost on restart, not shared across instances.

Note field naming: the `Emergency` model uses lowercase `placename`/`contactno`, plus its own `id` (UUID) field separate from Mongo `_id`. The frontend handles both casings in places.

## Frontend architecture (`frontend/src`)

React 19 + Vite + TypeScript, Tailwind, shadcn-style primitives in `components/ui/` (configured in `components.json`, `@/` path alias via `lib/utils`), React Router, TanStack Query.

- Routes (`App.tsx`): `/` → `screen/Emergency.tsx` (public map, the main app); `/admin` and `/test-admin` wrapped in `AdminRoute`; everything else redirects to `/unauthorized`.
- Map: plain Leaflet (not react-leaflet components) driven by hooks — `useMapSetup` creates the map, `useEmergencyMarkers` manages markers/clustering, `utils/mapUtils.ts` builds marker icons and popup HTML. Routing uses `leaflet-routing-machine`.
- Data: public map data uses `services/api.ts` (fetch) with interval polling in `Emergency.tsx`; admin data uses TanStack Query hooks in `hooks/queries/useAdmin.ts` with `refetchInterval` polling (5–10s). There are no websockets.
- Auth: token stored in `localStorage` (`AuthProvider` syncs across tabs); `services/authService.ts` exports the axios instance that attaches the Bearer token — use it for any authenticated call.
- `public/sw.js` is a service worker that caches OpenStreetMap tiles for offline use; it is registered from `App.tsx`. Bump `CACHE_NAME` when changing caching behavior.
- `src/App.js` is a stale compiled copy of `App.tsx` — edit the `.tsx`.
