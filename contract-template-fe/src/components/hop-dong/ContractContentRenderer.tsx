import type { ContentBlock } from "@/types/contractContent";

type ContractContentRendererProps = {
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

export default function ContractContentRenderer({
  blocks,
  sectionId,
}: ContractContentRendererProps) {
  return (
    <div className="space-y-5 text-[15px] leading-7 text-slate-700">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const headingId = createHeadingId(block.text, sectionId);

            if (block.level === 2) {
              return (
                <h2
                  key={`${headingId}-${index}`}
                  id={headingId}
                  className="scroll-mt-28 pt-3 text-xl font-bold leading-snug text-slate-900 md:text-2xl"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.level === 3) {
              return (
                <h3
                  key={`${headingId}-${index}`}
                  id={headingId}
                  className="scroll-mt-28 pt-2 text-lg font-semibold leading-snug text-slate-900"
                >
                  {block.text}
                </h3>
              );
            }

            return (
              <h4
                key={`${headingId}-${index}`}
                id={headingId}
                className="scroll-mt-28 pt-1 text-base font-semibold text-slate-800"
              >
                {block.text}
              </h4>
            );
          }

          case "paragraph":
            return (
              <p key={index} className="whitespace-pre-line">
                {block.text}
              </p>
            );

          case "list": {
            const ListTag = block.style === "number" ? "ol" : "ul";

            return (
              <ListTag
                key={index}
                className={
                  block.style === "number"
                    ? "list-decimal space-y-2 pl-6"
                    : "list-disc space-y-2 pl-6"
                }
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="pl-1">
                    {item}
                  </li>
                ))}
              </ListTag>
            );
          }

          case "quote":
            return (
              <blockquote
                key={index}
                className="border-l-4 border-emerald-700 bg-slate-50 px-5 py-3 italic text-slate-600"
              >
                {block.text}
              </blockquote>
            );

          case "callout":
            return (
              <aside
                key={index}
                className="rounded-lg border border-amber-200 bg-amber-50 p-4"
              >
                {block.title && (
                  <p className="mb-1 font-semibold text-amber-900">
                    {block.title}
                  </p>
                )}

                <p className="text-sm leading-6 text-amber-900">{block.text}</p>
              </aside>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
