# SzPOS (Offline-first POS Starter)

A scalable starter architecture for a modern POS system targeting Android tablets + PCs.

## Monorepo layout

- `apps/web`: React + Vite + Tailwind-ready PWA-friendly frontend
- `apps/api`: Express TypeScript backend with core POS endpoints
- `packages/shared`: shared POS domain types

## MVP included

- Tablet-focused Sale Screen with:
  - quick product buttons
  - line-item cart editing (+ / -)
  - payment action buttons (Cash/UPI/Card)
  - persistent Print Receipt button
- Offline-first local queue in frontend (`localStorage` based starter)
- Sync endpoint contract (`POST /api/sync`)
- Core API resources:
  - auth login
  - products search
  - sales create/get
  - low-stock inventory

## Run locally

### Prerequisites

- Node 20+
- npm 10+

### Install

```bash
npm install
```

### Run backend

```bash
npm run dev:api
```

### Run frontend

```bash
npm run dev:web
```

## New features in this update

- Dark mode toggle across dashboard and module pages
- Internal mention notes feature (`@username`)
- Local PostgreSQL setup documentation and starter schema

## PostgreSQL local setup

See `POSTGRES_SETUP.md` for step-by-step setup and schema initialization.

## Next build steps

- Replace local queue with IndexedDB (Dexie/PouchDB)
- Add JWT refresh flow + bcrypt persistence
- Add ESC/POS network and WebUSB print transports
- Add conflict-resolution policy for inventory writes
