import {
  Contract,
  ContractResponse,
  ContractType,
  ContractTypeResponse,
} from "@/types/contract";
import { axiosClient } from "./axiosClient";

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
