import LegalNavigation from "@/components/legal/LegalNavigation";
import type { ReactNode } from "react";

interface AboutInfoLayoutProps {
  children: ReactNode;
}

export default function AboutInfoLayout({ children }: AboutInfoLayoutProps) {
  return (
    <div className="min-h-[70vh] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-7">
          <aside
            className="
              sticky top-[calc(var(--header-h)+12px)] z-30
              min-w-0
              lg:top-24 lg:z-auto lg:self-start
            "
          >
            <LegalNavigation />
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
