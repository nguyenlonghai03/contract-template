interface PaymentTabsProps {
  activeTab: "qr" | "bank";
  onChange: (tab: "qr" | "bank") => void;
}

export default function PaymentTabs({ activeTab, onChange }: PaymentTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Phương thức thanh toán"
      className="flex border-b border-slate-200/80 px-4 sm:px-6"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "qr"}
        onClick={() => onChange("qr")}
        className={`flex-1 min-h-11 px-2 py-3 text-sm font-bold border-b-2 transition-colors ${
          activeTab === "qr"
            ? "border-emerald-600 text-emerald-600"
            : "border-transparent text-slate-500 hover:text-slate-700"
        }`}
      >
        Thanh toán QR
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "bank"}
        onClick={() => onChange("bank")}
        className={`flex-1 min-h-11 px-2 py-3 text-sm font-bold border-b-2 transition-colors ${
          activeTab === "bank"
            ? "border-emerald-600 text-emerald-600"
            : "border-transparent text-slate-500 hover:text-slate-700"
        }`}
      >
        Chuyển khoản
      </button>
    </div>
  );
}
