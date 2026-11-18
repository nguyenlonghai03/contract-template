# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Vietnamese contract-template marketplace ("Hợp Đồng Pháp Lý", hopdongphaply.vn). Customers browse templates, pay by bank-transfer QR (SePay/VietQR), then download the purchased Word/PDF file. Admins upload templates, which are stored in Cloudflare R2. The monorepo holds two apps that are deployed separately:

- `contract-template-be/`: Go backend (Gin + GORM/PostgreSQL)
- `contract-template-fe/`: Next.js 16 frontend (App Router, React 19, TypeScript, Tailwind v4), deployed to Cloudflare Workers via OpenNext
- `docs/technical`, `docs/business`: technical docs and business rules

## Rules

Detailed instructions live in `.claude/rules/` and load automatically. Files with `paths:` frontmatter load only when Claude works on matching files:

- `workflow.md`: context management & coding principles (always loaded)
- `api-contract.md`: keeping BE models and FE types in sync
- `backend/dev-environment.md`: Go commands, env vars, migrations, deploy
- `backend/architecture.md`: Gin pipeline, public vs. admin routes
- `domain/admin-contracts.md`: Draft → preview → Published flow, public cache invalidation, previews
- `domain/payment.md`: SePay QR/webhook, order states, download
- `frontend/nextjs.md`: Next.js commands, data-access paths, structure
