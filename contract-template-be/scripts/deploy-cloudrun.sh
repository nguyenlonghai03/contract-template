#!/usr/bin/env bash
# Deploy contract-template-api lên Cloud Run, đọc config/secrets từ .env nội bộ.
# Chạy từ thư mục contract-template-be/: bash scripts/deploy-cloudrun.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Khong tim thay .env trong contract-template-be/. Hay tao file nay truoc." >&2
  exit 1
fi

set -a
source .env
set +a

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID trong .env hoac export truoc khi chay script}"
REGION="${GCP_REGION:-asia-southeast1}"
SERVICE="${GCP_SERVICE_NAME:-contract-template-api}"

gcloud config set project "$GCP_PROJECT_ID" >/dev/null

echo "==> Dong bo secrets len Secret Manager"
for SECRET_VAR in DB_PASSWORD R2_SECRET_ACCESS_KEY ADMIN_API_KEY ORDER_ACCESS_SECRET SEPAY_WEBHOOK_API_KEY; do
  VALUE="${!SECRET_VAR:-}"
  if [ -z "$VALUE" ]; then
    echo "Thieu $SECRET_VAR trong .env" >&2
    exit 1
  fi

  if gcloud secrets describe "$SECRET_VAR" >/dev/null 2>&1; then
    printf '%s' "$VALUE" | gcloud secrets versions add "$SECRET_VAR" --data-file=- >/dev/null
  else
    printf '%s' "$VALUE" | gcloud secrets create "$SECRET_VAR" --data-file=- >/dev/null
  fi
  echo "  - $SECRET_VAR: ok"
done

# Biến môi trường thường. Dùng dấu "|" làm phân cách (cú pháp ^|^ của gcloud)
# vì ALLOWED_ORIGINS có thể chứa dấu phẩy.
ENV_VARS=(
  "GIN_MODE=${GIN_MODE:-release}"
  "DB_HOST=${DB_HOST}"
  "DB_PORT=${DB_PORT:-5432}"
  "DB_USER=${DB_USER}"
  "DB_NAME=${DB_NAME}"
  "DB_SSLMODE=${DB_SSLMODE:-require}"
  "DB_MAX_OPEN_CONNS=${DB_MAX_OPEN_CONNS:-5}"
  "ALLOWED_ORIGINS=${ALLOWED_ORIGINS}"
  "R2_ACCOUNT_ID=${R2_ACCOUNT_ID}"
  "R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}"
  "R2_ENDPOINT=${R2_ENDPOINT}"
  "R2_BUCKET_NAME=${R2_BUCKET_NAME}"
  "R2_REGION=${R2_REGION:-auto}"
  "MAX_UPLOAD_SIZE_MB=${MAX_UPLOAD_SIZE_MB:-20}"
)
# Biến tùy chọn: chỉ gửi khi có giá trị trong .env.
for OPT_VAR in BANK_ID BANK_ACCOUNT_NO BANK_ACCOUNT_NAME BANK_NAME FRONTEND_REVALIDATE_URL TRUSTED_PROXIES; do
  if [ -n "${!OPT_VAR:-}" ]; then
    ENV_VARS+=("$OPT_VAR=${!OPT_VAR}")
  fi
done
ENV_VARS_ARG="^|^$(IFS='|'; echo "${ENV_VARS[*]}")"

SECRETS_ARG="DB_PASSWORD=DB_PASSWORD:latest,R2_SECRET_ACCESS_KEY=R2_SECRET_ACCESS_KEY:latest,ADMIN_API_KEY=ADMIN_API_KEY:latest,ORDER_ACCESS_SECRET=ORDER_ACCESS_SECRET:latest,SEPAY_WEBHOOK_API_KEY=SEPAY_WEBHOOK_API_KEY:latest"
if [ -n "${REVALIDATE_SECRET:-}" ]; then
  if gcloud secrets describe REVALIDATE_SECRET >/dev/null 2>&1; then
    printf '%s' "$REVALIDATE_SECRET" | gcloud secrets versions add REVALIDATE_SECRET --data-file=- >/dev/null
  else
    printf '%s' "$REVALIDATE_SECRET" | gcloud secrets create REVALIDATE_SECRET --data-file=- >/dev/null
  fi
  echo "  - REVALIDATE_SECRET: ok"
  SECRETS_ARG+=",REVALIDATE_SECRET=REVALIDATE_SECRET:latest"
fi

echo "==> Deploy Cloud Run service: $SERVICE ($REGION)"
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=3 \
  --memory=512Mi \
  --cpu=1 \
  --set-env-vars="$ENV_VARS_ARG" \
  --set-secrets="$SECRETS_ARG"

echo "==> Xong. Lay URL service bang: gcloud run services describe $SERVICE --region $REGION --format='value(status.url)'"
