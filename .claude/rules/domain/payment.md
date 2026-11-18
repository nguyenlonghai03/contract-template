---
paths:
  - "contract-template-be/controllers/bank_controller.go"
  - "contract-template-be/controllers/order_controller.go"
  - "contract-template-be/controllers/contract_controller.go"
  - "contract-template-be/models/bank_model.go"
  - "contract-template-be/models/order_model.go"
  - "contract-template-be/models/checkout_session_model.go"
  - "contract-template-fe/src/hooks/usePayment.ts"
  - "contract-template-fe/src/services/paymentService.ts"
  - "contract-template-fe/src/components/hop-dong/{BankTransfer,Payment*,PurchaseButton,SuccessDownloadModal}.tsx"
---

# Payment, orders & download

- `GenerateQRCodeHandler` (`controllers/bank_controller.go`) only sells `published` contracts. It reuses the order the browser saved (`order_code` + `access_token` in the request body, stored in localStorage by `usePayment.ts`) when valid; otherwise it falls back to the `CheckoutSession` cookie (`SameSite=None; Secure`, hashed token, 7-day expiry), and creates a new `Order` if neither matches. Response includes `access_token`.
- Order codes are `HD` + 12 uppercase hex chars (legacy orders: `HD` + 8 lowercase hex). The code is printed in the bank transfer content, so it is **not** a secret.
- **Access token** = HMAC-SHA256(`ORDER_ACCESS_SECRET`, order code), first 32 hex chars (`controllers/payment_security.go`). `GET /api/orders/status` and `GET /api/contract/download` require `order_code` + `access_token`; a wrong token gets the same response as a missing order. Rotating `ORDER_ACCESS_SECRET` invalidates every saved order/download link.
- `SePayWebhookHandler` (`POST /api/webhook/bank`) first checks `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>` (constant-time; missing key ⇒ reject all). It extracts candidates with `(?i)HD[0-9A-F]{8,}` (fixed-length prefixes, case-insensitive, `UPPER(id)` lookup), validates the amount and destination account (`BANK_ACCOUNT_NO`), and inside a transaction marks the order `Success`, using `SePayTransaction.se_pay_id` uniqueness and a `RowsAffected` check to stay idempotent. Keep these guards when changing the webhook.
- The webhook and the reconciler share `processSePayTransaction` (`bank_controller.go`); put new payment guards there so both paths stay identical.
- **Reconciler** (`controllers/sepay_reconcile.go`, enabled by `SEPAY_API_TOKEN`): on startup and every `SEPAY_RECONCILE_INTERVAL` (default 5m), it pulls incoming transactions from the SePay User API (`GET /userapi/transactions/list`, Bearer token, last `SEPAY_RECONCILE_LOOKBACK` = 72h, filtered by `BANK_ACCOUNT_NO`). It skips anything already stored (by `se_pay_id`, or by `reference_code` + amount) and processes the rest. This recovers payments whose webhooks were lost; SePay itself retries for only ~33 min.
- Unmatched transactions (order not found, already paid, amount mismatch, wrong account) are still stored in `se_pay_transactions` with `result` ≠ `matched` for reconciliation/refunds.
- Order states: `Pending` → `Success` or `Expired`. Nothing sets `Expired` yet (not implemented by design for now). The frontend polls `GET /api/orders/status` every 3s, pauses while the tab is hidden, and stops after 30 min / on 404 / on `Expired`.
- **Download** (`DownloadContractHandler`): checks token + paid order, then redirects (302) to a presigned R2 URL with an RFC 5987 `Content-Disposition`. The FE opens it in a new tab so backend errors don't navigate away from the modal.
- Public payment endpoints are rate-limited per client IP (`middleware/rate_limit.go`); `ClientIP()` relies on `TRUSTED_PROXIES`.
