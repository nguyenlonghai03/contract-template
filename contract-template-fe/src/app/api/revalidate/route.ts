import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

import { CONTRACT_TAGS } from "@/services/contractApi";

// Backend gọi endpoint này sau khi admin generate preview / publish hợp đồng
// (xem contract-template-be/controllers/frontend_revalidate.go) để xoá Data
// Cache của Next.js ngay, không phải chờ hết thời gian `revalidate`.
//
// Body: { "contract_id"?: number }. Header: Authorization: Bearer <REVALIDATE_SECRET>.
// REVALIDATE_SECRET là biến server-only (KHÔNG có tiền tố NEXT_PUBLIC_).

function isAuthorized(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return false;

  const provided = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ success: false }, { status: 401 });
  }

  let contractId: number | undefined;

  try {
    const body = (await request.json()) as { contract_id?: unknown };
    const id = Number(body?.contract_id);
    if (Number.isSafeInteger(id) && id > 0) contractId = id;
  } catch {
    // Body rỗng / không phải JSON: chỉ làm mới danh sách.
  }

  // { expire: 0 }: request tiếp theo lấy dữ liệu mới ngay (không phục vụ bản
  // cũ) — giá hiển thị phải khớp với giá backend dùng để tạo QR.
  const profile = { expire: 0 };

  revalidateTag(CONTRACT_TAGS.list, profile);
  revalidateTag(CONTRACT_TAGS.types, profile);

  if (contractId) {
    revalidateTag(CONTRACT_TAGS.detail(contractId), profile);
  }

  return Response.json({ success: true, contract_id: contractId ?? null });
}
