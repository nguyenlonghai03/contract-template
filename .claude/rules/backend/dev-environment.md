---
paths:
  - "contract-template-be/**"
---

# Backend: commands, environment, database, deploy

Run from `contract-template-be/`. Module path: `github.com/nguyenlonghai03/contract-template/contract-template-be`.

```bash
go run .                                  # run API locally (reads ./.env), default port 8080
go build -o main .                        # build binary (same as Dockerfile)
go vet ./...
go test ./...                             # tests: internal/cache, controllers (payment_security)
go test ./internal/cache -run TestName    # single test
```

- `pdftoppm` (poppler-utils) must be on PATH to generate previews. The Docker image includes it, but local Windows/macOS setups need to install it by hand.
- Env keys: `PORT`, `GIN_MODE` (must be debug/release/test; defaults to release), `ALLOWED_ORIGINS` (comma-separated), `TRUSTED_PROXIES` (default loopback, for Caddy), `DB_*` (host/port/user/password/name/sslmode — default `require` — plus pool tuning), `R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_ENDPOINT`/`R2_REGION`/`R2_BUCKET_NAME`, `ADMIN_API_KEY`, `MAX_UPLOAD_SIZE_MB`, `ORDER_ACCESS_SECRET` (required), `SEPAY_WEBHOOK_API_KEY`, optional `SEPAY_API_TOKEN` (enables the SePay reconciliation job) + `SEPAY_RECONCILE_INTERVAL`/`SEPAY_RECONCILE_LOOKBACK` (Go durations), optional `BANK_ID`/`BANK_ACCOUNT_NO`/`BANK_ACCOUNT_NAME`/`BANK_NAME`, optional `FRONTEND_REVALIDATE_URL` + `REVALIDATE_SECRET` (backend pings the FE `/api/revalidate` after preview/publish). Startup fails if the R2 vars or `ORDER_ACCESS_SECRET` are missing.
- The DB is Neon Postgres. The schema is hand-written SQL in `migrations/` (numbered). No migration runner exists, so apply the files manually in order.
- Deploy: `scripts/deploy-cloudrun.sh` (Cloud Run; syncs secrets to Secret Manager) or `deploy/redeploy.sh`, which runs on an Oracle VM, rebuilds the Docker container bound to 127.0.0.1:8080, and sits behind Caddy (`deploy/Caddyfile`).
