"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { CheckCircle2, Circle, FileCheck2, Loader2, Upload, XCircle } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { slugify } from "@/lib/stringUtils";
import { adminContractSchema, AdminContractFormValues } from "@/types/adminContractSchema";
import {
  useAdminContract,
  useAdminContractTypes,
  useCreateContract,
  useGeneratePreview,
  usePublishContract,
} from "@/hooks/useAdminContract";

type Step = "create" | "preview" | "publish";
type StepStatus = "pending" | "running" | "done" | "failed";

const STEPS: { key: Step; label: string }[] = [
  { key: "create", label: "Tải file gốc lên & tạo hợp đồng" },
  { key: "preview", label: "Sinh ảnh preview" },
  { key: "publish", label: "Publish lên website" },
];

const STEP_ERROR_FALLBACK: Record<Step, string> = {
  create: "Không thể tạo hợp đồng",
  preview: "Không thể sinh ảnh preview",
  publish: "Không thể publish hợp đồng",
};

// contractId nằm trên URL (?id=...) để tải lại trang / mở lại tab vẫn làm
// tiếp được bản Draft đang dở, thay vì để lại Draft mồ côi chiếm slug.
function parseContractId(value: string | null): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

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

function FileUploadBox({ label, accept, file, disabled, onChange }: FileUploadBoxProps) {
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

      <span className={`text-sm font-semibold ${file ? "text-emerald-700" : "text-slate-700"}`}>
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

// useSearchParams cần Suspense boundary khi build.
export default function NewAdminContractPage() {
  return (
    <Suspense fallback={null}>
      <NewAdminContractWizard />
    </Suspense>
  );
}

function NewAdminContractWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = parseContractId(searchParams.get("id"));

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  const contractTypesQuery = useAdminContractTypes();
  const contractTypes = contractTypesQuery.data ?? [];

  const savedContract = useAdminContract(contractId);

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

  // Bước đang chạy / bước bị lỗi của quy trình 1 nút (create → preview → publish).
  const [runningStep, setRunningStep] = useState<Step | null>(null);
  const [failedStep, setFailedStep] = useState<Step | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  // Đổi key để remount form (xoá file đã chọn trong <input type="file">) khi tạo hợp đồng khác.
  const [formKey, setFormKey] = useState(0);

  const savedData = savedContract.data?.data;
  const isPublished = publishContract.isSuccess || savedData?.status === "published";
  const isRunning = runningStep !== null;
  // Đã tạo Draft (có id) hoặc đang chạy thì khoá form, tránh tạo trùng.
  const formLocked = Boolean(contractId) || isRunning;

  // Đã có Draft (?id=) nhưng chưa publish: lần trước bị lỗi giữa chừng hoặc tải lại trang.
  const hasUnfinishedDraft = Boolean(contractId) && !isPublished && !isRunning;

  // Mở lại Draft đang dở: điền lại thông tin đã lưu vào form (chỉ để xem).
  useEffect(() => {
    if (!savedData) return;

    form.reset({
      title: savedData.title,
      contract_type_id: String(savedData.contract_type_id),
      slug: savedData.slug,
      description: savedData.description ?? "",
      price: String(savedData.price),
    });
  }, [savedData, form]);

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

    runPipeline("create", formData);
  };

  // Chạy tuần tự create → generate preview → publish. Lỗi ở bước nào thì dừng ở bước đó,
  // admin bấm "Thử lại" để chạy tiếp từ đúng bước bị lỗi (Draft đã tạo vẫn giữ id trên URL).
  const runPipeline = async (start: Step, formData?: FormData) => {
    let current: Step = start;
    let id = contractId;

    setFailedStep(null);
    setErrorMessage("");

    try {
      if (start === "create") {
        setRunningStep("create");
        const res = await createContract.mutateAsync(formData as FormData);
        id = res.data.id;
        // Đưa id lên URL: tải lại trang / lỗi giữa chừng vẫn làm tiếp được Draft này.
        router.replace(`?id=${id}`);
      }

      if (!id) return;

      if (start !== "publish") {
        current = "preview";
        setRunningStep("preview");
        await generatePreview.mutateAsync(id);
      }

      current = "publish";
      setRunningStep("publish");
      await publishContract.mutateAsync(id);
    } catch (error) {
      setFailedStep(current);
      setErrorMessage(getErrorMessage(error, STEP_ERROR_FALLBACK[current]));
    } finally {
      setRunningStep(null);
    }
  };

  const handleRetry = () => {
    if (!contractId) return;
    // Lỗi ở publish thì publish lại; còn lại (lỗi preview / tải lại trang) sinh lại preview rồi publish.
    runPipeline(failedStep === "publish" ? "publish" : "preview");
  };

  const handleCreateAnother = () => {
    router.replace("/admin/contracts/new");
    form.reset();
    setPdfFile(null);
    setDocxFile(null);
    setFileError("");
    setFailedStep(null);
    setErrorMessage("");
    createContract.reset();
    generatePreview.reset();
    publishContract.reset();
    setFormKey((key) => key + 1);
  };

  const getStepStatus = (step: Step): StepStatus => {
    if (isPublished) return "done";

    const index = STEPS.findIndex((s) => s.key === step);
    const activeStep = runningStep ?? failedStep ?? (contractId ? "preview" : null);
    if (!activeStep) return "pending";

    const activeIndex = STEPS.findIndex((s) => s.key === activeStep);
    if (index < activeIndex) return "done";
    if (index > activeIndex) return "pending";
    if (runningStep) return "running";
    if (failedStep) return "failed";
    return "pending";
  };

  const showProgress = isRunning || Boolean(contractId) || failedStep !== null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Tạo hợp đồng mẫu mới</h1>

      <Card key={formKey} className={formLocked ? "opacity-60" : ""}>
        <CardHeader>
          <CardTitle>Thông tin & file gốc</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tên hợp đồng</label>
              <Input
                disabled={formLocked}
                value={form.watch("title")}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ví dụ: Hợp đồng thuê nhà"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Loại hợp đồng</label>
              <Select
                items={contractTypeItems}
                disabled={formLocked}
                value={form.watch("contract_type_id")}
                onValueChange={(value) => form.setValue("contract_type_id", value as string)}
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
              {contractTypesQuery.isError && (
                <p className="text-xs text-red-500">
                  Không tải được danh sách loại hợp đồng, vui lòng tải lại trang.
                </p>
              )}
              {errors.contract_type_id && (
                <p className="text-xs text-red-500">{errors.contract_type_id.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Slug</label>
              <Input
                disabled={formLocked}
                {...form.register("slug")}
                placeholder="hop-dong-thue-nha"
              />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Mô tả</label>
              <Textarea
                disabled={formLocked}
                rows={4}
                {...form.register("description")}
                placeholder="Mô tả ngắn về hợp đồng"
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Giá bán (VNĐ)</label>
              <Input
                disabled={formLocked}
                type="number"
                {...form.register("price")}
                placeholder="99000"
              />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FileUploadBox
                label="File PDF gốc"
                accept=".pdf"
                file={pdfFile}
                disabled={formLocked}
                onChange={setPdfFile}
              />

              <FileUploadBox
                label="File DOCX gốc"
                accept=".docx"
                file={docxFile}
                disabled={formLocked}
                onChange={setDocxFile}
              />
            </div>

            {fileError && <p className="text-sm text-red-500">{fileError}</p>}

            {!formLocked && (
              <Button type="submit">{failedStep === "create" ? "Thử lại" : "Tạo hợp đồng"}</Button>
            )}
          </form>
        </CardContent>
      </Card>

      {showProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Tiến trình</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {STEPS.map(({ key, label }) => {
                const status = getStepStatus(key);
                return (
                  <li key={key} className="flex items-center gap-2 text-sm">
                    {status === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {status === "running" && (
                      <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                    )}
                    {status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                    {status === "pending" && <Circle className="w-4 h-4 text-slate-300" />}
                    <span
                      className={
                        status === "pending"
                          ? "text-slate-400"
                          : status === "failed"
                            ? "text-red-600"
                            : "text-slate-700"
                      }
                    >
                      {label}
                      {status === "running" && "..."}
                    </span>
                  </li>
                );
              })}
            </ul>

            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

            {hasUnfinishedDraft && failedStep !== "create" && (
              <div className="space-y-2">
                {!failedStep && (
                  <p className="text-sm text-slate-600">
                    Hợp đồng này đang ở trạng thái Draft, chưa được publish.
                  </p>
                )}
                <Button onClick={handleRetry}>
                  {failedStep ? "Thử lại" : "Tiếp tục sinh preview & publish"}
                </Button>
              </div>
            )}

            {isPublished && (
              <div className="space-y-3">
                <p className="text-sm text-emerald-600 font-medium">
                  Hợp đồng đã được publish lên website thành công!
                </p>
                <div className="flex flex-wrap gap-2">
                  {savedData?.slug && (
                    <Link
                      href={`/hop-dong/${savedData.slug}-${contractId}`}
                      target="_blank"
                      className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
                    >
                      Xem trên website
                    </Link>
                  )}
                  <Button onClick={handleCreateAnother}>Tạo hợp đồng khác</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
