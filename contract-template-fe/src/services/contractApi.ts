import { ContractResponse } from "@/types/contract";
import { axiosClient } from "./axiosClient";

export const getContractTypes = async () => {
  const response = await axiosClient.get("/contract-types");
  return response.data;
};

export async function getContracts(
  page: number = 1,
  limit: number = 5,
  searchQuery: string = "",
): Promise<ContractResponse> {
  const res = await axiosClient.get<ContractResponse>("/contracts", {
    params: {
      page,
      limit,
      keyword: searchQuery,
    },
  });

  return res as unknown as ContractResponse;
}

// Thêm hàm gọi API vào file service của bạn
export const getContractById = async (id: string | number) => {
  // Vì interceptor đã trả về response.data, nên res ở đây chính là dữ liệu JSON từ Backend
  const res = await axiosClient.get(`/contracts/${id}`);
  return res;
};

export const getContractsByContractType = async (
  typeId: number | string,
  page = 1,
  limit = 6,
) => {
  const res = await axiosClient.get(
    `/contracts/type/${typeId}?page=${page}&limit=${limit}`,
  );
  return res;
};
