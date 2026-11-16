import type { ReactNode } from "react";

interface LegalContentProps {
  children: ReactNode;
}

export default function LegalContent({ children }: LegalContentProps) {
  return (
    <article
      className="
      min-w-0
      rounded-2xl
      border border-slate-200/80
      bg-white
      px-5 py-7
      shadow-sm
      sm:px-8 sm:py-9
      lg:px-12 lg:py-11
    "
    >
      <div className="mx-auto w-full max-w-4xl">{children}</div>
    </article>
  );
}
