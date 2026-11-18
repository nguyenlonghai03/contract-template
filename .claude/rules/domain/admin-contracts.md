---
paths:
  - "contract-template-be/controllers/admin_contract_controller.go"
  - "contract-template-be/controllers/contract_controller.go"
  - "contract-template-be/controllers/preview_controller.go"
  - "contract-template-be/controllers/public_cache.go"
  - "contract-template-be/internal/**"
  - "contract-template-be/services/**"
  - "contract-template-be/models/contract_model.go"
  - "contract-template-fe/src/app/admin/**"
  - "contract-template-fe/src/hooks/useAdminContract.ts"
  - "contract-template-fe/src/services/adminContractService.ts"
---

# Contracts: admin lifecycle, public caching, previews

- **Admin contract lifecycle** (`controllers/admin_contract_controller.go`):
  1. Create, which uploads files to R2 with status `Draft`.
  2. `POST /:id/generate-preview`, which rasterizes the PDF and uploads the preview images to R2.
  3. `PATCH /:id/publish`, which sets status to `Published`.

  The old public `GET /api/contract/generate-preview` (local disk) was removed. The admin wizard keeps the draft id in the URL (`/admin/contracts/new?id=`) so it can be resumed. Admin `:id` params must be parsed with `strconv.ParseUint` (GORM treats non-numeric strings passed to `First` as raw SQL).

  Public listing and detail endpoints return only `Published` contracts.
- **Public caching** (`controllers/public_cache.go`, `internal/cache`): public reads use in-memory stale-while-revalidate and LRU caches. Any write that changes public contract data must call `InvalidateContractCaches(id)` and `notifyFrontendRevalidate(id)` (FE Data Cache, see `frontend_revalidate.go`). The preview proxy `/api/previews/...` intentionally serves draft previews too, because the admin wizard shows them through plain `<img>` (no admin header). Public responses use `models.PublicContract`, which deliberately hides original filenames and R2 object keys.
- **Previews** (`services/pdf_service.go`): `pdftoppm` renders each page to PNG. The right ~30% of each page is then blurred and covered with a banner, so only part of the document is visible before purchase.
- **Admin auth on the frontend** runs client-side only: `src/components/admin/AdminGuard.tsx` checks for `admin_api_key` in localStorage, and `axiosClient.ts` attaches it as `X-Admin-Api-Key` **only to `/admin/*` requests**; a 401 clears the key.
