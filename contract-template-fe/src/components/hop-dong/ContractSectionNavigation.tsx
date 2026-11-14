const sections = [
  {
    id: "gioi-thieu",
    label: "Giới thiệu",
  },
  {
    id: "thong-tin-hop-dong",
    label: "Thông tin hợp đồng",
  },
  {
    id: "huong-dan",
    label: "Hướng dẫn",
  },
];

export default function ContractSectionNavigation() {
  return (
    <nav
      aria-label="Điều hướng nội dung hợp đồng"
      className="sticky top-0 z-30 -mx-4 border-y border-slate-200 bg-white/95 px-4 backdrop-blur md:mx-0 md:rounded-lg md:border"
    >
      <ul className="flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
        {sections.map((section) => (
          <li key={section.id} className="shrink-0">
            <a
              href={`#${section.id}`}
              className="inline-flex min-h-12 items-center border-b-2 border-transparent text-sm font-medium text-slate-600 transition-colors hover:border-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
