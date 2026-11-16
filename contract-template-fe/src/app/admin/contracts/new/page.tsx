"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Image from "next/image";
import { FileCheck2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getContractTypes } from "@/services/contractApi";
import type { ContractType } from "@/types/contract";
import { slugify } from "@/lib/stringUtils";
import {
  adminContractSchema,
  AdminContractFormValues,
} from "@/types/adminContractSchema";
import {
  useCreateContract,
  useGeneratePreview,
  usePublishContract,
} from "@/hooks/useAdminContract";

const BACKEND_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api\/?$/, "");

type Step = "form" | "preview" | "published";

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || fallback;
  }
  return fallback;
}

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

type FileUploadBoxProps = {
  label: string;
  accept: string;
  file: File | null;
  disabled: boolean;
  onChange: (file: File | null) => void;
};

function FileUploadBox({
  label,
  accept,
  file,
  disabled,
  onChange,
}: FileUploadBoxProps) {
  return (
    <label
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition cursor-pointer ${
        disabled
          ? "cursor-not-allowed opacity-50 border-slate-200 bg-slate-50"
          : file
            ? "border-emerald-500 bg-emerald-50 hover:bg-emerald-100"
            : "border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50"
      }`}
    >
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="hidden"
      />

      {file ? (
        <FileCheck2 className="w-8 h-8 text-emerald-600" />
      ) : (
        <Upload className="w-8 h-8 text-slate-400" />
      )}

      <span
        className={`text-sm font-semibold ${
          file ? "text-emerald-700" : "text-slate-700"
        }`}
      >
        {label}
      </span>

      {file ? (
        <span className="text-xs text-emerald-600 break-all">
          {file.name} · {formatFileSize(file.size)}
        </span>
      ) : (
        <span className="text-xs text-slate-400">Click để chọn file</span>
      )}
    </label>
  );
}

export default function NewAdminContractPage() {
  const [step, setStep] = useState<Step>("form");
  const [contractId, setContractId] = useState<number | null>(null);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const form = useForm<AdminContractFormValues>({
    resolver: zodResolver(adminContractSchema),
    defaultValues: {
      title: "",
      contract_type_id: "",
      slug: "",
      description: "",
      price: "",
    },
  });

  const errors = form.formState.errors;

  // items cho Select: để <SelectValue> hiển thị tên loại hợp đồng thay vì id thô.
  const contractTypeItems = contractTypes.map((type) => ({
    label: type.name,
    value: String(type.id),
  }));

  const createContract = useCreateContract();
  const generatePreview = useGeneratePreview();
  const publishContract = usePublishContract();

  useEffect(() => {
    getContractTypes()
      .then(setContractTypes)
      .catch(() => setContractTypes([]));
  }, []);

  // Tự sinh slug theo title, trừ khi admin đã tự sửa slug khác với bản auto-generate trước đó.
  const handleTitleChange = (value: string) => {
    const previousAutoSlug = slugify(form.getValues("title"));
    const currentSlug = form.getValues("slug");

    form.setValue("title", value);

    if (!currentSlug || currentSlug === previousAutoSlug) {
      form.setValue("slug", slugify(value));
    }
  };

  const onSubmit = (values: AdminContractFormValues) => {
    setFileError("");

    if (!pdfFile) {
      setFileError("Vui lòng chọn file PDF");
      return;
    }

    if (!docxFile) {
      setFileError("Vui lòng chọn file DOCX");
      return;
    }

    if (!pdfFile.name.toLowerCase().endsWith(".pdf")) {
      setFileError("File PDF phải có đuôi .pdf");
      return;
    }

    if (!docxFile.name.toLowerCase().endsWith(".docx")) {
      setFileError("File DOCX phải có đuôi .docx");
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("contract_type_id", values.contract_type_id);
    formData.append("slug", values.slug);
    formData.append("description", values.description);
    formData.append("price", values.price);
    formData.append("pdf_file", pdfFile);
    formData.append("docx_file", docxFile);

    createContract.mutate(formData, {
      onSuccess: (res) => {
        setContractId(res.data.id);
        setStep("preview");
      },
    });
  };

  const handleGeneratePreview = () => {
    if (!contractId) return;

    generatePreview.mutate(contractId, {
      onSuccess: (res) => setPreviewUrls(res.preview_urls),
    });
  };

  const handlePublish = () => {
    if (!contractId) return;

    publishContract.mutate(contractId, {
      onSuccess: () => setStep("published"),
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">
        Tạo hợp đồng mẫu mới
      </h1>

      {/* BƯỚC 1: THÔNG TIN + UPLOAD FILE GỐC */}
      <Card className={step !== "form" ? "opacity-60" : ""}>
        <CardHeader>
          <CardTitle>Bước 1: Thông tin & file gốc</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Tên hợp đồng
              </label>
              <Input
                disabled={step !== "form"}
                value={form.watch("title")}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ví dụ: Hợp đồng thuê nhà"
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Loại hợp đồng
              </label>
              <Select
                items={contractTypeItems}
                disabled={step !== "form"}
                value={form.watch("contract_type_id")}
                onValueChange={(value) =>
                  form.setValue("contract_type_id", value as string)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại hợp đồng" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contract_type_id && (
                <p className="text-xs text-red-500">
                  {errors.contract_type_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Slug
              </label>
              <Input
                disabled={step !== "form"}
                {...form.register("slug")}
                placeholder="hop-dong-thue-nha"
              />
              {errors.slug && (
                <p className="text-xs text-red-500">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Mô tả
              </label>
              <Textarea
                disabled={step !== "form"}
                rows={4}
                {...form.register("description")}
                placeholder="Mô tả ngắn về hợp đồng"
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Giá bán (VNĐ)
              </label>
              <Input
                disabled={step !== "form"}
                type="number"
                {...form.register("price")}
                placeholder="99000"
              />
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FileUploadBox
                label="File PDF gốc"
                accept=".pdf"
                file={pdfFile}
                disabled={step !== "form"}
                onChange={setPdfFile}
              />

              <FileUploadBox
                label="File DOCX gốc"
                accept=".docx"
                file={docxFile}
                disabled={step !== "form"}
                onChange={setDocxFile}
              />
            </div>

            {fileError && <p className="text-sm text-red-500">{fileError}</p>}

            {createContract.isError && (
              <p className="text-sm text-red-500">
                {getErrorMessage(createContract.error, "Không thể tạo hợp đồng")}
              </p>
            )}

            {step === "form" && (
              <Button type="submit" disabled={createContract.isPending}>
                {createContract.isPending
                  ? "Đang tạo..."
                  : "Tạo hợp đồng (Draft)"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* BƯỚC 2: SINH ẢNH PREVIEW */}
      {contractId && (
        <Card className={step === "published" ? "opacity-60" : ""}>
          <CardHeader>
            <CardTitle>Bước 2: Sinh ảnh preview</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === "preview" && previewUrls.length === 0 && (
              <Button
                onClick={handleGeneratePreview}
                disabled={generatePreview.isPending}
              >
                {generatePreview.isPending
                  ? "Đang sinh ảnh preview..."
                  : "Generate Preview"}
              </Button>
            )}

            {generatePreview.isError && (
              <p className="text-sm text-red-500">
                {getErrorMessage(
                  generatePreview.error,
                  "Không thể sinh ảnh preview, vui lòng thử lại",
                )}
              </p>
            )}

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {previewUrls.map((url) => (
                  <div
                    key={url}
                    className="relative aspect-[3/4] border border-slate-200 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={`${BACKEND_ORIGIN}${url}`}
                      alt="Ảnh preview hợp đồng"
                      fill
                      sizes="(max-width: 640px) 33vw, 220px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* BƯỚC 3: PUBLISH */}
      {contractId && previewUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bước 3: Publish</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {step === "published" ? (
              <p className="text-sm text-emerald-600 font-medium">
                Hợp đồng đã được publish thành công!
              </p>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  Xác nhận {previewUrls.length} ảnh preview phía trên đã đúng
                  trước khi publish.
                </p>

                <Button
                  onClick={handlePublish}
                  disabled={publishContract.isPending}
                >
                  {publishContract.isPending ? "Đang publish..." : "Publish"}
                </Button>

                {publishContract.isError && (
                  <p className="text-sm text-red-500">
                    {getErrorMessage(
                      publishContract.error,
                      "Không thể publish hợp đồng",
                    )}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
