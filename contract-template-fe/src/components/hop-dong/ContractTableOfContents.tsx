import type { ContentBlock } from "@/types/contractContent";

type ContractTableOfContentsProps = {
  blocks: ContentBlock[];
  sectionId: string;
};

function createHeadingId(text: string, sectionId: string) {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${sectionId}-${slug}`;
}

export default function ContractTableOfContents({
  blocks,
  sectionId,
}: ContractTableOfContentsProps) {
  const headings = blocks.filter(
    (block): block is Extract<ContentBlock, { type: "heading" }> =>
      block.type === "heading" && block.level >= 2 && block.level <= 3,
  );

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Mục lục thông tin hợp đồng"
      className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5"
    >
      <p className="mb-3 font-semibold text-slate-900">Nội dung bài viết</p>

      <ol className="space-y-2">
        {headings.map((heading, index) => (
          <li
            key={`${heading.text}-${index}`}
            className={heading.level === 3 ? "pl-4" : ""}
          >
            <a
              href={`#${createHeadingId(heading.text, sectionId)}`}
              className="text-sm leading-6 text-slate-600 transition-colors hover:text-emerald-800 hover:underline"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
