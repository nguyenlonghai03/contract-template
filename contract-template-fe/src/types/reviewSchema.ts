import { z } from "zod";

export const reviewSchema = z.object({
  author_name: z.string().trim().min(1, "Vui lòng điền họ và tên!"),

  phone: z
    .string()
    .trim()
    .min(1, "Vui lòng điền số điện thoại!")
    .regex(
      /^0[35789][0-9]{8}$/,
      "Số điện thoại không hợp lệ (ví dụ: 0981234567)!",
    ),

  comment: z.string().trim().min(1, "Vui lòng điền nội dung đánh giá!"),

  accept_policy: z.boolean().refine((value) => value === true, {
    message: "Bạn phải đồng ý với chính sách thu thập thông tin để tiếp tục!",
  }),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
