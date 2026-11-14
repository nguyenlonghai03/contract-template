import Image from "next/image";

type DocumentPagesProps = {
  title: string;
  images: string[];
};

export default function DocumentPages({ title, images }: DocumentPagesProps) {
  const totalPages = images.length;

  return (
    <div className="flex flex-col items-center gap-4">
      {images.map((image, index) => {
        const pageNum = index + 1;

        return (
          <article
            key={pageNum}
            data-contract-page={pageNum}
            aria-label={`Trang ${pageNum} trên ${totalPages}`}
            className="
              relative
              w-full
              max-w-[760px]
              flex-none
              overflow-hidden
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >
            {/* A4 PREVIEW */}
            <div className="relative aspect-[210/297] w-full">
              <Image
                src={image}
                alt={`${title} - Trang ${pageNum}`}
                fill
                priority={pageNum === 1}
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 65vw, 760px"
                className="object-contain"
              />
            </div>

            {/* PAGE NUMBER */}
            <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center">
              <span
                className="
                  rounded-full
                  bg-white/90
                  px-3
                  py-1
                  text-[10px]
                  font-medium
                  text-slate-500
                  shadow-sm
                "
              >
                Trang {pageNum} / {totalPages}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
