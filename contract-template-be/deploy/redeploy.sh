#!/usr/bin/env bash
# Chay script nay TREN VM Oracle, trong thu muc contract-template-be/, sau khi da `git pull`
# hoac cap nhat code moi. Build lai image va restart container, giu nguyen .env.
set -euo pipefail

IMAGE_NAME="contract-template-api"
CONTAINER_NAME="contract-api"

if [ ! -f .env ]; then
  echo ".env khong ton tai trong thu muc hien tai." >&2
  exit 1
fi

echo "==> Build image moi"
sudo docker build -t "$IMAGE_NAME" .

echo "==> Dung va xoa container cu (neu co)"
sudo docker stop "$CONTAINER_NAME" 2>/dev/null || true
sudo docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "==> Chay container moi (chi bind localhost, Caddy se proxy vao)"
sudo docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --env-file .env \
  -p 127.0.0.1:8080:8080 \
  "$IMAGE_NAME"

echo "==> Don image cu khong dung nua"
sudo docker image prune -f

echo "==> Xong. Kiem tra: curl -s http://localhost:8080/healthz"
