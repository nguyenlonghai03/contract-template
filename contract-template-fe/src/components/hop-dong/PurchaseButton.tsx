"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { Contract } from "@/types/contract";

type Props = {
  contract: Contract;
};

export default function PurchaseButton({ contract }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2 tracking-wide cursor-pointer"
      >
        <Download className="w-5 h-5" />
        <span>TẢI NGAY</span>
      </button>

      <PaymentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        contract={contract}
      />
    </>
  );
}
