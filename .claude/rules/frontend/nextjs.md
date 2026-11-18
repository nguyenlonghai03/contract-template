---
paths:
  - "contract-template-fe/**"
---

# Frontend: commands & architecture

Run from `contract-template-fe/`:

```bash
npm run dev      # dev server on localhost:3000
npm run build
npm run lint     # eslint
```

- No test suite exists.
- `NEXT_PUBLIC_API_BASE_URL` must point at the backend's `/api` base (default `http://localhost:8080/api`).
- Cloudflare deploy: `npx opennextjs-cloudflare build`, then `npx wrangler deploy` (configured in `wrangler.toml` and `open-next.config.ts`; no npm script wraps these). OpenNext uses an R2 incremental cache (`NEXT_INC_CACHE_R2_BUCKET`) plus Durable Object tag cache/queue; `src/app/api/revalidate/route.ts` (secret `REVALIDATE_SECRET`) lets the backend call `revalidateTag`.
- Follow `contract-template-fe/AGENTS.md`. This Next.js version has breaking changes, so read the relevant guide in `contract-template-fe/node_modules/next/dist/docs/` before writing Next.js code.

## Structure

- Routes live under `src/app/(main)/`: home (`page.tsx`), `hop-dong/[slug]` (detail), `tim-kiem` (search), `(about-info)/` (static legal pages). Admin routes are under `src/app/admin/` (`login`, `contracts/new`).
- There are two data-access paths:
  - **Server Components** use `src/services/apiFetch.ts` (`apiGet`, native `fetch`) so they get Next.js Data Cache and memoization. Revalidate intervals are in `REVALIDATE` in `src/lib/config.ts`.
  - **Client components** use `axiosClient.ts` with `@tanstack/react-query`. `src/hooks/usePayment.ts` handles QR generation and order-status polling, and `useAdminContract.ts` handles the admin upload flow.
- Use `resolveBackendUrl()` (`src/lib/config.ts`) for image or asset URLs returned by the backend, since they may be absolute (R2/CDN) or relative to the backend origin.
- `src/types/*.ts` mirror the backend models, with zod schemas for forms. The UI uses shadcn components in `src/components/ui`.
