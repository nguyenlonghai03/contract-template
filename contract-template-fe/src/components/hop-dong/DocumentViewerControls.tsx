"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";

type DocumentViewerControlsProps = {
  title: string;
  images: string[];
  children: ReactNode;
};

export default function DocumentViewerControls({
  title,
  images,
  children,
}: DocumentViewerControlsProps) {
  const [activePage, setActivePage] = useState(1);

  const totalPages = images.length;

  const thumbnailListRef = useRef<HTMLDivElement>(null);
  const contentViewerRef = useRef<HTMLDivElement>(null);

  const pageRefs = useRef<Map<number, HTMLElement>>(new Map());
  const thumbnailRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Trạng thái cuộn bằng thao tác chọn thumbnail
  const isProgrammaticScrollRef = useRef(false);

  // Quản lý timeout kết thúc cuộn
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quản lý animation frame
  const animationFrameRef = useRef<number | null>(null);

  // Xóa timeout
  const clearScrollTimer = useCallback(() => {
    if (scrollEndTimerRef.current !== null) {
      clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = null;
    }
  }, []);

  // Kết thúc cuộn chủ động
  const finishProgrammaticScroll = useCallback(() => {
    clearScrollTimer();
    isProgrammaticScrollRef.current = false;
  }, [clearScrollTimer]);

  // Chọn trang từ thumbnail
  const handleSelectPage = useCallback(
    (pageNum: number) => {
      const container = contentViewerRef.current;
      const pageElement = pageRefs.current.get(pageNum);

      if (!container || !pageElement) return;

      // Cập nhật trang đang chọn
      setActivePage(pageNum);

      // Đánh dấu đang cuộn chủ động
      isProgrammaticScrollRef.current = true;

      clearScrollTimer();

      const containerRect = container.getBoundingClientRect();
      const pageRect = pageElement.getBoundingClientRect();

      const targetPosition =
        container.scrollTop +
        pageRect.top -
        containerRect.top -
        container.clientTop;

      container.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      // Fallback nếu không nhận được sự kiện scroll kết thúc
      scrollEndTimerRef.current = setTimeout(() => {
        finishProgrammaticScroll();
      }, 1500);
    },
    [clearScrollTimer, finishProgrammaticScroll],
  );

  // Theo dõi sự kiện scroll
  const handleContentScroll = useCallback(() => {
    if (!isProgrammaticScrollRef.current) return;

    clearScrollTimer();

    // Chờ 180ms không có chuyển động
    scrollEndTimerRef.current = setTimeout(() => {
      finishProgrammaticScroll();
    }, 180);
  }, [clearScrollTimer, finishProgrammaticScroll]);

  // Tự động cuộn thumbnail đến trang đang chọn
  useEffect(() => {
    const container = thumbnailListRef.current;
    const thumbnail = thumbnailRefs.current.get(activePage);

    if (!container || !thumbnail) return;

    const containerRect = container.getBoundingClientRect();
    const thumbnailRect = thumbnail.getBoundingClientRect();

    const padding = 8;

    if (thumbnailRect.top < containerRect.top + padding) {
      container.scrollTo({
        top:
          container.scrollTop + thumbnailRect.top - containerRect.top - padding,
        behavior: "auto",
      });
    } else if (thumbnailRect.bottom > containerRect.bottom - padding) {
      container.scrollTo({
        top:
          container.scrollTop +
          thumbnailRect.bottom -
          containerRect.bottom +
          padding,
        behavior: "auto",
      });
    }
  }, [activePage]);

  // Theo dõi trang đang hiển thị
  useEffect(() => {
    const container = contentViewerRef.current;

    if (!container) return;

    // Lấy các trang đã được render từ Server Component
    const pages = container.querySelectorAll<HTMLElement>(
      "[data-contract-page]",
    );

    pageRefs.current.clear();

    pages.forEach((element) => {
      const pageNum = Number(element.dataset.contractPage);

      if (Number.isInteger(pageNum)) {
        pageRefs.current.set(pageNum, element);
      }
    });

    const observer = new IntersectionObserver(
      () => {
        // Không cập nhật khi đang cuộn bằng thumbnail
        if (isProgrammaticScrollRef.current) return;

        // Gom nhiều lần callback vào một animation frame
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const containerRect = container.getBoundingClientRect();

          const visibleTop = containerRect.top + container.clientTop;
          const visibleBottom = visibleTop + container.clientHeight;

          let mostVisiblePage = 1;
          let maxVisibleRatio = 0;

          pageRefs.current.forEach((element, pageNum) => {
            const rect = element.getBoundingClientRect();

            if (rect.height <= 0) return;

            const visiblePageTop = Math.max(rect.top, visibleTop);

            const visiblePageBottom = Math.min(rect.bottom, visibleBottom);

            const visibleHeight = Math.max(
              0,
              visiblePageBottom - visiblePageTop,
            );

            const visibleRatio = visibleHeight / rect.height;

            if (visibleRatio > maxVisibleRatio) {
              maxVisibleRatio = visibleRatio;
              mostVisiblePage = pageNum;
            }
          });

          if (maxVisibleRatio > 0) {
            setActivePage((current) =>
              current === mostVisiblePage ? current : mostVisiblePage,
            );
          }

          animationFrameRef.current = null;
        });
      },
      {
        root: container,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    pageRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      pageRefs.current.clear();

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [totalPages]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      clearScrollTimer();

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [clearScrollTimer]);

  return (
    <>
      {/* DOCUMENT VIEWER */}
      <div
        className="
          grid
          h-[min(78vh,720px)]
          min-h-[420px]
          grid-cols-[64px_minmax(0,1fr)]
          gap-2
          overflow-hidden
          rounded-xl
          border border-slate-200/80
          bg-slate-100/90
          p-2
          sm:grid-cols-[80px_minmax(0,1fr)]
          sm:gap-3
          sm:p-3
          md:grid-cols-[100px_minmax(0,1fr)]
        "
      >
        {/* THUMBNAILS */}
        <aside className="flex min-h-0 flex-col overflow-hidden border-r border-slate-200/80 pr-1">
          <div
            ref={thumbnailListRef}
            aria-label="Danh sách trang tài liệu"
            className="
              flex-1
              space-y-3
              overflow-y-auto
              overscroll-contain
              px-1
              py-1
              scrollbar-thin
              scrollbar-thumb-slate-300
              scrollbar-track-transparent
            "
          >
            {images.map((image, index) => {
              const pageNum = index + 1;
              const isSelected = activePage === pageNum;

              return (
                <button
                  key={pageNum}
                  ref={(element) => {
                    if (element) {
                      thumbnailRefs.current.set(pageNum, element);
                    } else {
                      thumbnailRefs.current.delete(pageNum);
                    }
                  }}
                  type="button"
                  onClick={() => handleSelectPage(pageNum)}
                  aria-label={`Xem trang ${pageNum}`}
                  aria-current={isSelected ? "page" : undefined}
                  className="
                    group
                    flex
                    w-full
                    flex-col
                    items-center
                    gap-1
                    rounded-md
                    outline-none
                    focus-visible:ring-2
                    focus-visible:ring-emerald-500
                  "
                >
                  <div
                    className={`
                      relative
                      aspect-[210/297]
                      w-full
                      overflow-hidden
                      rounded-sm
                      bg-white
                      shadow-sm
                      ${
                        isSelected
                          ? "ring-2 ring-emerald-500 ring-offset-1"
                          : "border border-slate-300 group-hover:border-slate-500"
                      }
                    `}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${title} - Trang ${pageNum}`}
                      fill
                      sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 100px"
                      className="object-contain"
                    />
                  </div>

                  <span
                    className={`
                      text-xs font-semibold
                      ${isSelected ? "text-emerald-700" : "text-slate-500"}
                    `}
                  >
                    {pageNum}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN DOCUMENT VIEWER */}
        <div
          ref={contentViewerRef}
          onScroll={handleContentScroll}
          aria-label="Nội dung xem trước hợp đồng"
          className="
            relative
            min-h-0
            min-w-0
            overflow-y-auto
            overscroll-contain
            rounded-lg
            border border-slate-300
            bg-slate-200/70
            p-2
            sm:p-4
            scrollbar-thin
            scrollbar-thumb-slate-400
            scrollbar-track-slate-100
          "
        >
          {children}
        </div>
      </div>

      {/* VIEWER FOOTER */}
      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          gap-2
          px-1
          text-xs
          text-slate-500
        "
      >
        <span>Xem trước tài liệu</span>

        <span className="font-medium tabular-nums">
          Trang {activePage} / {totalPages}
        </span>
      </div>
    </>
  );
}
