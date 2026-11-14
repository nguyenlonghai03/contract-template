"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createReview } from "@/services/reviewService";

import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import { CustomerReviewsClientProps } from "@/types/review";
import { ReviewFormValues, reviewSchema } from "@/types/reviewSchema";

// ============================================
// MAIN COMPONENT
// ============================================

export default function CustomerReviewsClient({
  contractId,
  initialReviews,
  initialError,
}: CustomerReviewsClientProps) {
  const router = useRouter();

  // ------------------------------------------
  // VALIDATE CONTRACT ID
  // ------------------------------------------

  const numericContractId = Number(contractId);

  const isValidContractId =
    Number.isSafeInteger(numericContractId) && numericContractId > 0;

  // ------------------------------------------
  // LOCAL UI STATE
  // ------------------------------------------

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ------------------------------------------
  // REACT HOOK FORM
  // ------------------------------------------

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),

    defaultValues: {
      author_name: "",
      phone: "",
      comment: "",
      accept_policy: false,
    },
  });

  // ------------------------------------------
  // MUTATION: CREATE REVIEW
  // ------------------------------------------

  const mutation = useMutation({
    mutationFn: createReview,

    onSuccess: () => {
      setSuccessMessage(
        "Gửi đánh giá thành công! Đang chờ quản trị viên kiểm duyệt.",
      );

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
            "Không thể gửi đánh giá, vui lòng thử lại sau.",
        );
      } else {
        setErrorMessage("Đã xảy ra lỗi không xác định.");
      }
    },
  });

  // ------------------------------------------
  // SUBMIT FORM
  // ------------------------------------------

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

  // ============================================
  // RENDER
  // ============================================

  return (
    <section
      aria-labelledby="customer-reviews-heading"
      className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6 md:p-8 space-y-6 text-slate-800"
    >
      {/* REVIEW LIST */}

      <ReviewList
        reviews={initialReviews}
        initialError={initialError}
        onRetry={() => router.refresh()}
      />

      {/* REVIEW FORM */}

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
    </section>
  );
}
