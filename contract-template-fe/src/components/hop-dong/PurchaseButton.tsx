"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Download } from "lucide-react";
import { Contract } from "@/types/contract";

// Modal thanh toán (dialog, QR, polling đơn hàng, axios…) chỉ cần khi khách
// bấm "TẢI NGAY" nên được tách chunk riêng, không nằm trong JS ban đầu.
const loadPaymentModal = () => import("./PaymentModal");
const PaymentModal = dynamic(loadPaymentModal, { ssr: false });

type Props = {
  contract: Contract;
};

export default function PurchaseButton({ contract }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  // Chỉ mount modal sau lần mở đầu tiên (giữ lại sau đó để đóng/mở mượt).
  const [hasOpened, setHasOpened] = useState(false);

  const handleOpen = () => {
    setHasOpened(true);
    setIsOpen(true);
  };

  // Tải trước chunk khi người dùng có ý định bấm (hover/focus/chạm).
  const preload = () => {
    void loadPaymentModal();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        onMouseEnter={preload}
        onFocus={preload}
        onTouchStart={preload}
        className="w-full bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2 tracking-wide cursor-pointer"
      >
        <Download className="w-5 h-5" />
        <span>TẢI NGAY</span>
      </button>

      {hasOpened && (
        <PaymentModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          contract={contract}
        />
      )}
    </>
  );
}
