"use client";

import { useMutation } from "@tanstack/react-query";
import {
  AdminContractResponse,
  GeneratePreviewResponse,
  createContract,
  generatePreview,
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
