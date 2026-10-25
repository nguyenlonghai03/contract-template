import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutWaitingPage({
  orderCode,
}: {
  orderCode: string;
}) {
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Nếu đã thành công thì không cần chạy polling nữa
    if (isSuccess) return;

    // Thiết lập interval gọi API kiểm tra trạng thái mỗi 3 giây
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/orders/status?order_code=${orderCode}`,
        );
        const data = await response.json();

        if (data.success && data.status === "Success") {
          setIsSuccess(true);
          clearInterval(interval); // Dừng polling ngay lập tức
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái đơn hàng:", error);
      }
    }, 3000); // 3000ms = 3 giây

    // Dọn dẹp interval khi người dùng rời khỏi trang
    return () => clearInterval(interval);
  }, [orderCode, isSuccess]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {!isSuccess ? (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            Đang chờ bạn quét mã thanh toán...
          </h2>
          <p className="text-gray-500">
            Hệ thống sẽ tự động chuyển trang ngay khi nhận được tiền.
          </p>
          {/* Hiển thị QR Code, số tiền, nội dung chuyển khoản ở đây */}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Thanh toán thành công! 🎉
          </h2>
          <p className="mb-6">
            Cảm ơn bạn đã mua hàng. Bạn có thể tải tài liệu ngay bên dưới:
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleDownload(orderCode, "word")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tải file Word (.docx)
            </button>
            <button
              onClick={() => handleDownload(orderCode, "pdf")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tải file PDF (.pdf)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
