"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createReview } from "@/services/reviewService";
import { ReviewFormValues, reviewSchema } from "@/types/reviewSchema";

import ReviewForm from "./ReviewForm";

type ReviewFormContainerProps = {
  contractId: string;
};

// Toàn bộ phần form đánh giá (react-hook-form + zod + axios) được tách riêng
// và tải lazy từ CustomerReviewsClient, để các thư viện nặng này không nằm
// trong JS bắt buộc của trang chi tiết hợp đồng.
export default function ReviewFormContainer({ contractId }: ReviewFormContainerProps) {
  const router = useRouter();

  const numericContractId = Number(contractId);

  const isValidContractId = Number.isSafeInteger(numericContractId) && numericContractId > 0;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),

    defaultValues: {
      author_name: "",
      phone: "",
      comment: "",
      accept_policy: false,
    },
  });

  const mutation = useMutation({
    mutationFn: createReview,

    onSuccess: () => {
      setSuccessMessage("Gửi đánh giá thành công! Đang chờ quản trị viên kiểm duyệt.");

      setErrorMessage("");

      form.reset();

      setRating(5);
      setHoverRating(0);

      // Fetch lại dữ liệu từ Server Component
      router.refresh();
    },

    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Không thể gửi đánh giá, vui lòng thử lại sau.",
        );
      } else {
        setErrorMessage("Đã xảy ra lỗi không xác định.");
      }
    },
  });

  const onSubmit = (values: ReviewFormValues) => {
    if (!isValidContractId) return;

    setErrorMessage("");
    setSuccessMessage("");

    mutation.mutate({
      contract_id: numericContractId,
      author_name: values.author_name,
      phone: values.phone,
      rating,
      comment: values.comment,
    });
  };

  return (
    <ReviewForm
      form={form}
      onSubmit={onSubmit}
      rating={rating}
      hoverRating={hoverRating}
      onRatingChange={setRating}
      onHoverRatingChange={setHoverRating}
      isPending={mutation.isPending}
      isValidContractId={isValidContractId}
      errorMessage={errorMessage}
      successMessage={successMessage}
    />
  );
}
