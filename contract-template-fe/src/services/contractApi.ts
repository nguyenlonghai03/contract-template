import { Contract, ContractResponse, ContractType, ContractTypeResponse } from "@/types/contract";
import { API_BASE_URL, REVALIDATE } from "@/lib/config";
import { apiGet } from "./apiFetch";

// Tag dùng cho revalidateTag khi cần làm mới dữ liệu theo yêu cầu.
export const CONTRACT_TAGS = {
  types: "contract-types",
  list: "contracts",
  detail: (id: string | number) => `contract-${id}`,
} as const;

export const getContractTypes = async (): Promise<ContractType[]> => {
  const response = await apiGet<ContractTypeResponse>("/contract-types", {
    revalidate: REVALIDATE.contractTypes,
    tags: [CONTRACT_TAGS.types],
  });
  return response.data;
};

export async function getContracts(
  page: number = 1,
  limit: number = 5,
  searchQuery: string = "",
): Promise<ContractResponse> {
  return apiGet<ContractResponse>("/contracts", {
    params: { page, limit, keyword: searchQuery },
    revalidate: REVALIDATE.contractList,
    tags: [CONTRACT_TAGS.list],
  });
}

export const getContractById = async (id: string | number) => {
  return apiGet<{ data: Contract; success: boolean }>(
    `/contracts/${encodeURIComponent(String(id))}`,
    {
      revalidate: REVALIDATE.contractDetail,
      tags: [CONTRACT_TAGS.list, CONTRACT_TAGS.detail(id)],
    },
  );
};

export const getContractsByContractType = async (
  typeId: number | string,
  page: number = 1,
  limit: number = 6,
): Promise<ContractResponse> => {
  return apiGet<ContractResponse>(`/contracts/type/${encodeURIComponent(String(typeId))}`, {
    params: { page, limit },
    revalidate: REVALIDATE.contractList,
    tags: [CONTRACT_TAGS.list],
  });
};

type FileType = "word" | "pdf";

// Điều hướng trực tiếp tới endpoint download (không fetch blob qua JS).
// Lý do: với hợp đồng tạo qua Admin, backend trả 302 redirect sang R2 — nếu
// fetch bằng axios/XHR, trình duyệt sẽ chặn đọc response vì R2 không cấu hình
// CORS cho origin của FE. Điều hướng thì trình duyệt tự theo redirect và lưu
// file theo header Content-Disposition mà backend đã set.
//
// Mở ở TAB MỚI: tải thành công thì tab tự đóng; nếu backend trả lỗi (403/404
// JSON) thì lỗi hiện ở tab mới, khách không bị đẩy khỏi trang + modal.
export function downloadContract(orderCode: string, accessToken: string, fileType: FileType) {
  const params = new URLSearchParams({
    order_code: orderCode,
    access_token: accessToken,
    type: fileType,
  });

  const link = document.createElement("a");
  link.href = `${API_BASE_URL}/contract/download?${params.toString()}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  document.body.appendChild(link);
  link.click();
  link.remove();
}
