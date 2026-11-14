"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import type { ContractContentSection } from "@/types/contract-content";
import type { Contract } from "@/types/contract";

import ContractContentRenderer from "./ContractContentRenderer";
import ContractTableOfContents from "./ContractTableOfContents";

type ContractInformationProps = {
  contract: Contract;
};

type SectionProps = {
  id: string;
  title: string;
  content?: ContractContentSection;
  beforeContent?: React.ReactNode;
  collapsible?: boolean;
};

function ContentSection({
  id,
  title,
  content,
  beforeContent,
  collapsible = false,
}: SectionProps) {
  const [expanded, setExpanded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Vị trí top của nút (so với viewport) ngay trước khi thu gọn
  const anchorTopRef = useRef<number | null>(null);

  // Chạy đồng bộ sau khi DOM đổi, TRƯỚC khi trình duyệt vẽ
  useLayoutEffect(() => {
    if (expanded || anchorTopRef.current === null) return;

    const button = buttonRef.current;
    if (!button) return;

    const delta = button.getBoundingClientRect().top - anchorTopRef.current;
    anchorTopRef.current = null;

    if (delta === 0) return;

    const root = document.documentElement;
    root.style.overflowAnchor = "none";
    window.scrollBy({ top: delta, behavior: "instant" }); // bỏ qua scroll-behavior: smooth của CSS
    // Trả lại scroll anchoring ở frame sau
    requestAnimationFrame(() => {
      root.style.overflowAnchor = "";
    });
  }, [expanded]);

  if (!content) return null;

  const handleToggle = () => {
    if (!expanded) {
      setExpanded(true);
      return;
    }

    const button = buttonRef.current;
    if (button) {
      anchorTopRef.current = button.getBoundingClientRect().top;
    }
    setExpanded(false);
  };
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-28 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:scroll-mt-36 sm:rounded-2xl sm:p-8 lg:p-10"
    >
      <h2
        id={`${id}-title`}
        className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold tracking-tight text-slate-900 sm:mb-6 sm:pb-4 sm:text-xl md:text-2xl"
      >
        {title}
      </h2>

      {beforeContent}

      <div
        id={`${id}-content`}
        className={`relative ${
          collapsible && !expanded
            ? "max-h-[360px] overflow-hidden sm:max-h-[500px]"
            : ""
        }`}
      >
        <div
          className="prose prose-sm prose-slate max-w-none break-words sm:prose-base
          prose-headings:scroll-mt-28 sm:prose-headings:scroll-mt-36
          prose-img:h-auto prose-img:max-w-full
          prose-pre:overflow-x-auto
          [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
        >
          <ContractContentRenderer blocks={content.blocks} sectionId={id} />
        </div>

        {collapsible && !expanded && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent sm:h-32"
          />
        )}
      </div>

      {collapsible && (
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={expanded}
          aria-controls={`${id}-content`}
          onClick={handleToggle}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 sm:mt-5 sm:py-3"
        >
          {expanded ? "Thu gọn" : "Xem toàn bộ nội dung"}

          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    </section>
  );
}

export default function ContractInformation({
  contract,
}: ContractInformationProps) {
  const introduction = contract.contents?.introduction;
  const details = contract.contents?.details;
  const guide = contract.contents?.guide;

  const [activeSection, setActiveSection] = useState<string>("gioi-thieu");

  const navItems = useMemo(
    () =>
      [
        {
          id: "gioi-thieu",
          label: "Giới thiệu về hợp đồng",
          shortLabel: "Giới thiệu",
          visible: !!introduction,
        },
        {
          id: "thong-tin-hop-dong",
          label: "Thông tin hợp đồng",
          shortLabel: "Thông tin",
          visible: !!details,
        },
        {
          id: "huong-dan",
          label: "Hướng dẫn sử dụng",
          shortLabel: "Hướng dẫn",
          visible: !!guide,
        },
      ].filter((item) => item.visible),
    [introduction, details, guide],
  );

  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!nav || !active) return;

    nav.scrollTo({
      left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [activeSection]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0,
      },
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navItems]);

  if (navItems.length === 0) {
    return null;
  }

  return (
    <article
      aria-label="Thông tin chi tiết về hợp đồng"
      className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-6 sm:py-8"
    >
      {/* THANH MỤC LỤC NGANG STICKY */}
      <div className="sticky top-[calc(var(--header-h)+20px)] z-30 mb-5 flex justify-center sm:top-[calc(var(--header-h)+12px)] sm:mb-8">
        {" "}
        <nav
          ref={navRef}
          aria-label="Điều hướng nội dung hợp đồng"
          className="relative inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200/90 bg-white/90 p-1 shadow-md backdrop-blur-md [scrollbar-width:none] sm:gap-1.5 sm:p-1.5 [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActiveSection(item.id)}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-200 sm:px-4 sm:text-sm ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* NỘI DUNG HỢP ĐỒNG */}
      <div className="space-y-8">
        {/* GIỚI THIỆU: LUÔN HIỂN THỊ */}
        <ContentSection
          id="gioi-thieu"
          title="Giới thiệu về hợp đồng"
          content={introduction}
        />

        {/* THÔNG TIN: CÓ THỂ THU GỌN */}
        <ContentSection
          id="thong-tin-hop-dong"
          title="Thông tin hợp đồng"
          content={details}
          collapsible
          beforeContent={
            details && (
              <div className="mb-6">
                <ContractTableOfContents
                  blocks={details.blocks}
                  sectionId="thong-tin-hop-dong"
                />
              </div>
            )
          }
        />

        {/* HƯỚNG DẪN: CÓ THỂ THU GỌN */}
        <ContentSection
          id="huong-dan"
          title="Hướng dẫn sử dụng hợp đồng"
          content={guide}
          collapsible
        />
      </div>
    </article>
  );
}
