import {
  Contract,
  ContractResponse,
  ContractType,
  ContractTypeResponse,
} from "@/types/contract";
import { axiosClient } from "./axiosClient";
import axios from "axios";

export const getContractTypes = async (): Promise<ContractType[]> => {
  // Thay vì any, hãy định nghĩa kiểu dữ liệu cụ thể cho contract types nếu có (ví dụ: ContractType[])
  const response = await axiosClient.get<unknown, ContractTypeResponse>(
    "/contract-types",
  );
  return response.data;
};

export async function getContracts(
  page: number = 1,
  limit: number = 5,
  searchQuery: string = "",
): Promise<ContractResponse> {
  // Dùng trực tiếp ContractResponse cho kiểu dữ liệu trả về của axios
  const res = await axiosClient.get<unknown, ContractResponse>("/contracts", {
    params: {
      page,
      limit,
      keyword: searchQuery,
    },
  });

  return res;
}

export const getContractById = async (id: string | number) => {
  const res = await axiosClient.get<
    unknown,
    { data: Contract; success: boolean }
  >(`/contracts/${id}`);
  return res;
};

export const getContractsByContractType = async (
  typeId: number | string,
  page: number = 1,
  limit: number = 6,
): Promise<ContractResponse> => {
  const res = await axiosClient.get<unknown, ContractResponse>(
    `/contracts/type/${typeId}`,
    {
      params: { page, limit },
    },
  );
  return res;
};

type FileType = "word" | "pdf";

export async function downloadContract(
  orderCode: string,
  contract: Contract,
  fileType: FileType,
) {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

  const downloadUrl =
    `${backendUrl}/contract/download` +
    `?order_code=${encodeURIComponent(orderCode)}` +
    `&type=${fileType}`;

  const response = await axios.get(downloadUrl, {
    responseType: "blob",
  });

  const isWord = fileType === "word";

  const mimeType = isWord
    ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    : "application/pdf";

  const extension = isWord ? "docx" : "pdf";

  const blob = new Blob([response.data], { type: mimeType });
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = `Hop-dong-${contract.title}.${extension}`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  // Chờ trình duyệt xử lý download trước khi giải phóng URL
  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 1000);
}
