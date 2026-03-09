# SzPOS (Offline-first POS Starter)

A modern POS starter designed for Android tablets + PCs with a colorful, touch-friendly sale experience.

## Monorepo layout

- `apps/web`: React + Vite POS frontend (responsive checkout UI)
- `apps/api`: Express TypeScript backend (POS endpoints)
- `packages/shared`: shared POS domain types

## What's improved

### UI/UX (sale screen)

- Bright, responsive 3-column checkout layout
- Large touch-friendly quick product buttons
- Category chips (no dropdown-heavy product picking)
- Inline line-item quantity controls (+ / -)
- Variant picker modal for products like Cake size
- Discount input + clear total breakdown
- Fast payment actions (Cash / UPI / Card)
- Keyboard shortcuts:
  - `Enter` = add first filtered product
  - `F1` / `F2` / `F3` = quick pay methods
- Persistent print actions:
  - Print Receipt
  - Print Kitchen Ticket
- Online/offline status badge for cashier confidence

### Offline-first + sync

- Local queue for writes (`localStorage` starter)
- Manual sync trigger to POST queued changes
- Sync API returns accepted count + conflict list for inventory updates

### API coverage (MVP+)

- `POST /api/auth/login`
- `GET /api/products?search=`
- `POST /api/sales`
- `GET /api/sales/:id`
- `GET /api/inventory/low-stock`
- `POST /api/sync`
- `GET /api/reports/daily-sales`
- `POST /api/returns`
- `POST /api/purchase-orders`
- `POST /api/printing/receipt`
- `GET /api/users`

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

### If styles do not appear

- Ensure you run the frontend with `npm run dev:web` from the monorepo root.
- Hard refresh the browser (`Ctrl+Shift+R`) to clear cached CSS.
- Confirm `apps/web/src/main.tsx` and `apps/web/src/components/SaleScreen.tsx` both import `styles.css`.

## Next steps

- Replace `localStorage` queue with IndexedDB (Dexie/PouchDB)
- Add PostgreSQL schema + migrations for production data integrity
- Add proper JWT refresh + bcrypt password storage
- Add ESC/POS transport implementations (LAN, WebUSB, Bluetooth)
- Add reconciliation UI for sync conflict resolution
