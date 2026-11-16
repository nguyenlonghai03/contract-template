# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Vietnamese contract-template marketplace ("Hợp Đồng Pháp Lý"). Customers browse contract templates, pay via bank-transfer QR code (SePay), and then download the purchased Word/PDF file. Two independently deployed apps live in this monorepo:

- `contract-template-be/` — Go (Gin + GORM/PostgreSQL) REST API
- `contract-template-fe/` — Next.js 16 (App Router, React 19, TypeScript, Tailwind v4) frontend, deployed to Cloudflare Workers via OpenNext

## Commands

### Backend (`contract-template-be/`)

```bash
go run .                 # run the API locally (reads ./.env via godotenv)
go build -o main .        # build binary (matches Dockerfile)
go mod tidy               # sync go.mod/go.sum after dependency changes
go vet ./...              # static checks
```

Only `internal/cache` has tests so far (`go test ./...`).

Public read endpoints (`/contracts`, `/contracts/:id`, `/contract-types`, reviews, `/previews`) are served through in-memory stale-while-revalidate caches in `controllers/public_cache.go`; any admin write that changes public contract data must call `InvalidateContractCaches(id)`. Public responses use `models.PublicContract`, which intentionally omits original file names / R2 object keys.

The backend requires `pdftoppm` (poppler-utils) on PATH for PDF preview generation (`services/pdf_service.go`) — this is installed in the Docker image but must be installed manually for local development on Windows/macOS.

Required `.env` keys are documented by the existing `contract-template-be/.env` (not committed): `PORT`, `GIN_MODE`, `ALLOWED_ORIGINS`, `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`/`DB_SSLMODE`, connection-pool tuning (`DB_MAX_OPEN_CONNS`, etc.), and Cloudflare R2 credentials (`R2_*`).

Database schema is managed by hand-written SQL files in `migrations/` — there is no migration runner wired up; apply them manually against Postgres in order.

### Frontend (`contract-template-fe/`)

```bash
npm run dev      # Next.js dev server (localhost:3000, uses Turbopack)
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
```

Deployment target is Cloudflare Workers via `@opennextjs/cloudflare` (`wrangler.toml`, `open-next.config.ts`); build with `opennextjs-cloudflare build` and deploy with `wrangler deploy` (via the `wrangler`/`@opennextjs/cloudflare` devDependencies — no npm script wraps these yet).

`NEXT_PUBLIC_API_BASE_URL` (see `contract-template-fe/.env`) must point at the backend's `/api` base.

## Architecture

### Backend request flow

`main.go` wires everything: loads the DB connection (`database/database_connection.go`), builds the Gin engine (CORS, recovery, health routes), then delegates route registration to `routes/unprotected_routes.go` and `routes/protected_routes.go` (the latter is currently empty — reserved for future authenticated/admin endpoints; `middleware/` and `internal/` are likewise empty placeholders).

All current API routes are public, under `/api`, and map to `controllers/`:
- `contract_controller.go` — list/search contract templates, fetch by id/type/slug, generate preview images, download the purchased file
- `review_controller.go` — create/list reviews per contract (reviews require `is_approved` before surfacing, per the `reviews` migration)
- `order_controller.go` — poll order status by order code (`GET /api/orders/status`)
- `bank_controller.go` — the payment flow: `GenerateQRCodeHandler` creates/reuses a `CheckoutSession` (hashed cookie token, 7-day expiry) and an `Order`, then returns a VietQR image URL; `SePayWebhookHandler` is the inbound webhook SePay calls on every bank transfer — it parses the order code out of the transfer content (`HD[A-Za-z0-9]+` regex), validates amount/destination account, and atomically marks the matching `Order` `Success` inside a `db.Transaction`, guarding against double-processing via the `SePayTransaction.se_pay_id` uniqueness check and `RowsAffected` check.

Order lifecycle: `Pending` → `Success` (via SePay webhook) or `Expired`. The frontend is expected to poll `GET /api/orders/status?order_code=...` while showing the QR code.

PDF preview generation (`services/pdf_service.go`) shells out to `pdftoppm` to rasterize each page, then uses `imaging`/`gg` to blur the right ~30% of each page and paint a green banner over it — this is a watermark-by-blur strategy so only part of the purchased document is visible before checkout. Generated previews are cached by filename (skipped if the output file already exists) and served statically from `/storage/previews`.

### Frontend structure

Next.js App Router, route groups under `src/app/(main)/`:
- `(main)/page.tsx` — homepage
- `(main)/hop-dong/[slug]/` — contract detail page
- `(main)/tim-kiem/` — search page
- `(main)/(about-info)/` — static info pages (chính sách, miễn trừ trách nhiệm, về chúng tôi), sharing their own `layout.tsx`

Data access goes through `src/services/*.ts` (`axiosClient.ts` is the shared Axios instance pointed at `NEXT_PUBLIC_API_BASE_URL`; `contractApi.ts`, `paymentService.ts`, `reviewService.ts` wrap the corresponding backend endpoints) paired with `@tanstack/react-query` (`src/providers/ReactQueryProvider.tsx`) for data fetching/caching. `src/hooks/usePayment.ts` encapsulates the QR-generation + order-status-polling flow used by the checkout UI. Types mirroring backend models live in `src/types/*.ts`.

## Notes for changes spanning both apps

Backend and frontend are deployed separately (Docker/Cloud Run-style for the API per the `Dockerfile`'s `PORT` handling; Cloudflare Workers for the frontend) and only communicate over HTTP — there is no shared types/package setup, so any change to a Go model/response shape must be mirrored manually in `contract-template-fe/src/types/` and the corresponding `services/*.ts` caller.
