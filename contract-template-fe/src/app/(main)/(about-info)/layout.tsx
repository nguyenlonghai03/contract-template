import AboutSidebar from "@/components/ve-chung-toi/AboutSideBar";

export default function AboutInfo({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-50/50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar chỉ khai báo 1 lần duy nhất cho toàn bộ nhóm trang info */}
        <div className="lg:col-span-3">
          <AboutSidebar />
        </div>

        {/* Nội dung thay đổi động của từng trang sẽ render ở đây */}
        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
