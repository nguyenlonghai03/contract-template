import { z } from "zod";

export const adminContractSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng điền tên hợp đồng!"),

  contract_type_id: z.string().trim().min(1, "Vui lòng chọn loại hợp đồng!"),

  slug: z
    .string()
    .trim()
    .min(1, "Vui lòng điền slug!")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang!"),

  description: z.string().trim().min(1, "Vui lòng điền mô tả!"),

  price: z
    .string()
    .trim()
    .min(1, "Vui lòng điền giá bán!")
    .regex(/^[0-9]+$/, "Giá bán phải là số!"),
});

export type AdminContractFormValues = z.infer<typeof adminContractSchema>;
