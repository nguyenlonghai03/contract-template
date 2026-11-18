---
paths:
  - "contract-template-be/**/*.go"
---

# Backend: request pipeline & routing

`main.go` connects the DB and creates the R2 S3 client. It then builds the Gin engine: logger, recovery, CORS (allows the `X-Admin-Api-Key` header and exposes `Content-Disposition`), and gzip (excluding downloads and `/storage/`). It also registers `/healthz`, `/readyz` and `/ping`, then hands off to `routes/`:

- `routes/unprotected_routes.go`: public `/api/*` routes, covering contracts, contract types, reviews, payment QR, order status, SePay webhook (`POST /api/webhook/bank`), the R2 preview proxy (`/api/previews/:contractId/:filename`), downloads, and legacy local previews under `/storage/previews`
- `routes/protected_routes.go`: `/api/admin/*`, guarded by `middleware.AdminAuth()`, which does a constant-time compare of the `X-Admin-Api-Key` header against `ADMIN_API_KEY`

Domain flows are documented in `.claude/rules/domain/` (admin contracts & caching, payment).
