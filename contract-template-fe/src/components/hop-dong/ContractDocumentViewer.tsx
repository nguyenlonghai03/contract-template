import { resolveBackendUrl } from "@/lib/config";
import type { Contract } from "@/types/contract";
import DocumentPages from "./DocumentPages";
import DocumentViewerControls from "./DocumentViewerControls";

type ContractDocumentViewerProps = {
  contract: Contract;
};

export default function ContractDocumentViewer({
  contract,
}: ContractDocumentViewerProps) {
  const images = (contract?.preview_images ?? [])
    .filter(
      (src): src is string => typeof src === "string" && src.trim().length > 0,
    )
    .map(resolveBackendUrl);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
        Hiện chưa có hình ảnh xem trước cho hợp đồng này.
      </div>
    );
  }

  return (
    <section
      aria-label={`Xem trước ${contract.title}`}
      className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm md:p-5"
    >
      <DocumentViewerControls title={contract.title} images={images}>
        <DocumentPages title={contract.title} images={images} />
      </DocumentViewerControls>
    </section>
  );
}
