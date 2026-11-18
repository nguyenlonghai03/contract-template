"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ContractType } from "@/types/contract";
import {
  AdminContractResponse,
  GeneratePreviewResponse,
  createContract,
  generatePreview,
  getAdminContract,
  getContractTypesForAdmin,
  publishContract,
} from "@/services/adminContractService";

export function useCreateContract() {
  return useMutation<AdminContractResponse, Error, FormData>({
    mutationFn: createContract,
  });
}

export function useGeneratePreview() {
  return useMutation<GeneratePreviewResponse, Error, number>({
    mutationFn: generatePreview,
  });
}

export function usePublishContract() {
  return useMutation<AdminContractResponse, Error, number>({
    mutationFn: publishContract,
  });
}

export function useAdminContract(contractId: number | null) {
  return useQuery<AdminContractResponse, Error>({
    queryKey: ["admin-contract", contractId],
    queryFn: () => getAdminContract(contractId as number),
    enabled: Boolean(contractId),
    staleTime: Infinity,
  });
}

export function useAdminContractTypes() {
  return useQuery<ContractType[], Error>({
    queryKey: ["admin-contract-types"],
    queryFn: getContractTypesForAdmin,
    staleTime: 60 * 60 * 1000,
  });
}
