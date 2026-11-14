import { connection } from "next/server";

import { getContractReviews } from "@/services/reviewService";
import type { GetReviewsResponse } from "@/types/review";
import CustomerReviewsClient from "./CustomerReviewsClient";

type CustomerReviewsProps = {
  contractId: string;
};

type Review = NonNullable<GetReviewsResponse["data"]>[number];

// Che số điện thoại ngay tại server trước khi gửi xuống client
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 7) return phone;

  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

export default async function CustomerReviews({
  contractId,
}: CustomerReviewsProps) {
  // Đảm bảo dữ liệu được lấy khi có request thực tế,
  // không bị cố định tại thời điểm build.
  await connection();

  const numericContractId = Number(contractId);

  const isValidContractId =
    Number.isSafeInteger(numericContractId) && numericContractId > 0;

  let initialReviews: Review[] = [];
  let initialError = false;

  if (isValidContractId) {
    try {
      const response = await getContractReviews(numericContractId);

      // Chỉ truyền thông tin đã được che số điện thoại xuống client
      initialReviews = (response?.data ?? []).map((review) => ({
        ...review,
        phone: maskPhoneNumber(review.phone),
      }));
    } catch (error) {
      console.error("Failed to fetch customer reviews:", error);
      initialError = true;
    }
  }

  return (
    <CustomerReviewsClient
      contractId={contractId}
      initialReviews={initialReviews}
      initialError={initialError}
    />
  );
}

// "use client";

// import { useState } from "react";
// import { Star, Loader2, ChevronDown, ChevronUp } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { getAvatarText } from "@/lib/stringUtils";
// import axios from "axios";
// import { createReview, getContractReviews } from "@/services/reviewService";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { GetReviewsResponse } from "@/types/review";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";

// // 1. Định nghĩa Schema validate bằng Zod
// const reviewSchema = z.object({
//   author_name: z.string().min(1, "Vui lòng điền họ và tên!"),
//   phone: z
//     .string()
//     .min(1, "Vui lòng điền số điện thoại!")
//     .regex(
//       /^(0[3|5|7|8|9])[0-9]{8}$/,
//       "Số điện thoại không hợp lệ (ví dụ: 0981234567)!",
//     ),
//   comment: z.string().min(1, "Vui lòng điền nội dung đánh giá!"),
//   accept_policy: z.boolean().refine((val) => val === true, {
//     message: "Bạn phải đồng ý với chính sách thu thập thông tin để tiếp tục!",
//   }),
// });

// type ReviewFormValues = z.infer<typeof reviewSchema>;

// type CustomerReviewsProps = {
//   contractId: string;
// };

// export default function CustomerReviews({ contractId }: CustomerReviewsProps) {
//   const queryClient = useQueryClient();

//   // State đánh giá sao
//   const [rating, setRating] = useState(5);
//   const [hoverRating, setHoverRating] = useState(0);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   // State quản lý hiển thị số lượng đánh giá (Mặc định hiện 3 đánh giá đầu)
//   const [visibleCount, setVisibleCount] = useState(3);

//   // 1. Dùng React Query lấy danh sách đánh giá
//   const { data: reviewData, isLoading } = useQuery<GetReviewsResponse>({
//     queryKey: ["reviews", contractId],
//     queryFn: () => getContractReviews(Number(contractId)),
//     enabled: !!contractId,
//   });

//   const reviews = reviewData?.data || [];
//   const displayedReviews = reviews.slice(0, visibleCount);
//   const hasMore = reviews.length > visibleCount;

//   // 2. Cấu hình React Hook Form với Zod Resolver
//   const form = useForm<ReviewFormValues>({
//     resolver: zodResolver(reviewSchema),
//     defaultValues: {
//       author_name: "",
//       phone: "",
//       comment: "",
//     },
//   });

//   // 3. Dùng useMutation để gửi đánh giá mới
//   const mutation = useMutation({
//     mutationFn: createReview,
//     onSuccess: () => {
//       setSuccessMessage(
//         "Gửi đánh giá thành công! Đang chờ quản trị viên kiểm duyệt.",
//       );
//       form.reset();
//       setRating(5);
//       queryClient.invalidateQueries({ queryKey: ["reviews", contractId] });
//     },
//     onError: (error: unknown) => {
//       if (axios.isAxiosError(error)) {
//         setErrorMessage(
//           error.response?.data?.error ||
//             "Không thể gửi đánh giá, vui lòng thử lại sau.",
//         );
//       } else {
//         setErrorMessage("Đã xảy ra lỗi không xác định.");
//       }
//     },
//   });

//   const onSubmit = (values: ReviewFormValues) => {
//     setErrorMessage("");
//     setSuccessMessage("");

//     mutation.mutate({
//       contract_id: Number(contractId),
//       author_name: values.author_name.trim(),
//       phone: values.phone.trim(),
//       rating: rating,
//       comment: values.comment.trim(),
//     });
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-6 text-slate-800">
//       {/* Tiêu đề phần đánh giá */}
//       <h3 className="text-base md:text-lg font-bold text-slate-900">
//         Đánh giá từ khách hàng ({reviews.length})
//       </h3>

//       {/* Danh sách các đánh giá */}
//       {isLoading ? (
//         <div className="flex justify-center py-6 text-slate-400">
//           <Loader2 className="w-6 h-6 animate-spin" />
//         </div>
//       ) : reviews.length === 0 ? (
//         <p className="text-sm text-slate-500 italic py-2">
//           Chưa có đánh giá nào cho hợp đồng này. Hãy là người đầu tiên đánh giá!
//         </p>
//       ) : (
//         <div className="space-y-4">
//           <div className="divide-y divide-slate-100">
//             {displayedReviews.map((item) => (
//               <div
//                 key={item.id}
//                 className="py-4 first:pt-0 last:pb-1 space-y-2"
//               >
//                 {/* Hàng thông tin: Trái là Avatar + Tên + SĐT + Ngày | Phải là Số sao */}
//                 <div className="flex items-center justify-between gap-2">
//                   {/* Cụm bên trái */}
//                   <div className="flex items-center gap-2.5 flex-wrap">
//                     <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-sm flex items-center justify-center shrink-0">
//                       {getAvatarText(item.author_name)}
//                     </span>

//                     <div className="flex items-center gap-1.5 flex-wrap text-sm">
//                       <span className="font-bold text-slate-900">
//                         {item.author_name}
//                       </span>
//                       <span className="text-slate-300 font-light">|</span>
//                       <span className="font-medium text-slate-700">
//                         {item.phone}
//                       </span>
//                       <span className="text-slate-300 font-light">|</span>
//                       <span className="text-slate-400 text-sm">
//                         {item.created_at}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Cụm bên phải: Đẩy riêng phần sao sang góc phải */}
//                   <div className="flex items-center gap-0.5 shrink-0">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <Star
//                         key={star}
//                         className={`w-3.5 h-3.5 ${
//                           star <= item.rating
//                             ? "text-amber-400 fill-amber-400"
//                             : "text-slate-200"
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 </div>

//                 {/* Nội dung đánh giá */}
//                 <p className="text-sm text-slate-600 leading-relaxed pl-[42px]">
//                   {item.comment}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* Nút Xem thêm / Thu gọn sử dụng Shadcn Button */}
//           {(hasMore || visibleCount > 3) && (
//             <div className="pt-2 flex justify-center">
//               {hasMore ? (
//                 <Button
//                   variant="outline"
//                   onClick={() => setVisibleCount((prev) => prev + 3)}
//                   className="text-sm font-semibold text-slate-600 hover:text-slate-900 border-slate-200 rounded-xl gap-1.5 cursor-pointer"
//                 >
//                   Xem thêm
//                   <ChevronDown className="w-3.5 h-3.5" />
//                 </Button>
//               ) : (
//                 <Button
//                   variant="outline"
//                   onClick={() => setVisibleCount(3)}
//                   className="text-sm font-semibold text-slate-600 hover:text-slate-900 border-slate-200 rounded-xl gap-1.5 cursor-pointer"
//                 >
//                   Thu gọn
//                   <ChevronUp className="w-3.5 h-3.5" />
//                 </Button>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Khung Nhập Đánh Giá Mới */}
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="pt-4 space-y-4 border-t border-slate-100"
//       >
//         <h4 className="text-sm font-semibold text-slate-900">
//           Gửi đánh giá của bạn
//         </h4>

//         <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white transition">
//           {/* Chọn số sao đánh giá */}
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-slate-500 font-medium">
//               Chất lượng:
//             </span>
//             <div className="flex items-center gap-1">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <button
//                   type="button"
//                   key={star}
//                   onClick={() => setRating(star)}
//                   onMouseEnter={() => setHoverRating(star)}
//                   onMouseLeave={() => setHoverRating(0)}
//                   className="focus:outline-none transition cursor-pointer"
//                 >
//                   <Star
//                     className={`w-4 h-4 ${
//                       star <= (hoverRating || rating)
//                         ? "text-amber-400 fill-amber-400"
//                         : "text-amber-400 stroke-[1.5]"
//                     }`}
//                   />
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Ô nhập Họ tên & Số điện thoại */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             <div className="space-y-1">
//               <Input
//                 type="text"
//                 placeholder="Họ và tên của bạn"
//                 {...form.register("author_name")}
//                 className={`text-sm ${
//                   form.formState.errors.author_name
//                     ? "border-red-300 focus-visible:ring-2 focus-visible:ring-red-200"
//                     : "border-slate-200 focus-visible:ring-emerald-200"
//                 }`}
//               />
//               {form.formState.errors.author_name && (
//                 <p className="text-sm text-red-500 font-medium">
//                   {form.formState.errors.author_name.message}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-1">
//               <Input
//                 type="tel"
//                 placeholder="Số điện thoại của bạn"
//                 {...form.register("phone")}
//                 className={`text-sm ${
//                   form.formState.errors.phone
//                     ? "border-red-300 focus-visible:ring-2 focus-visible:ring-red-200"
//                     : "border-slate-200 focus-visible:ring-emerald-200"
//                 }`}
//               />
//               {form.formState.errors.phone && (
//                 <p className="text-sm text-red-500 font-medium">
//                   {form.formState.errors.phone.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Ô nhập nội dung đánh giá */}
//           <div className="space-y-1">
//             <Textarea
//               rows={5}
//               placeholder="Nội dung đánh giá của bạn"
//               {...form.register("comment")}
//               className={`w-full min-h-[140px] text-sm border rounded-xl p-3 bg-white placeholder:text-slate-400 resize-y ${
//                 form.formState.errors.comment
//                   ? "border-red-300 focus-visible:ring-2 focus-visible:ring-red-200"
//                   : "border-slate-200 focus-visible:ring-emerald-200"
//               }`}
//             />
//             {form.formState.errors.comment && (
//               <p className="text-sm text-red-500 font-medium">
//                 {form.formState.errors.comment.message}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Thông báo lỗi / thành công */}
//         {errorMessage && (
//           <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
//         )}
//         {successMessage && (
//           <p className="text-sm text-emerald-600 font-medium">
//             {successMessage}
//           </p>
//         )}

//         {/* Checkbox chính sách */}
//         <div className="space-y-1 pt-1">
//           <div className="flex items-start gap-2.5">
//             <input
//               type="checkbox"
//               id="accept_policy"
//               {...form.register("accept_policy")}
//               className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
//             />
//             <label
//               htmlFor="accept_policy"
//               className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none"
//             >
//               Tôi đồng ý cho phép thu thập và xử lý số điện thoại, họ tên nhằm
//               mục đích hiển thị đánh giá và liên hệ hỗ trợ khi cần thiết. Cam
//               kết bảo mật thông tin cá nhân.
//             </label>
//           </div>
//           {form.formState.errors.accept_policy && (
//             <p className="text-sm text-red-500 font-medium pl-6">
//               {form.formState.errors.accept_policy.message}
//             </p>
//           )}
//         </div>

//         {/* Nút Gửi đánh giá */}
//         <div>
//           <Button
//             type="submit"
//             disabled={mutation.isPending}
//             className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
//           >
//             {mutation.isPending && (
//               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//             )}
//             Gửi đánh giá
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }
