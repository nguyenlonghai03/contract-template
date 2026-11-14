import type { Metadata } from "next";
import {
  CheckCircle2,
  FileText,
  ShieldCheck,
  Search,
  Download,
  RefreshCw,
} from "lucide-react";

import LegalContent from "@/components/ve-chung-toi/LegalContent";

export const metadata: Metadata = {
  title: "Về chúng tôi | Hợp Đồng Pháp Lý",
  description:
    "Hợp Đồng Pháp Lý cung cấp các mẫu hợp đồng, biểu mẫu pháp lý bằng Word và PDF, hỗ trợ cá nhân và doanh nghiệp tìm kiếm, tham khảo và sử dụng tài liệu thuận tiện.",
  alternates: {
    canonical: "https://hopdongphaply.vn/ve-chung-toi",
  },
  openGraph: {
    title: "Về chúng tôi | Hợp Đồng Pháp Lý",
    description:
      "Tìm hiểu về Hợp Đồng Pháp Lý – nền tảng cung cấp mẫu hợp đồng và biểu mẫu pháp lý dành cho cá nhân, doanh nghiệp.",
    url: "https://hopdongphaply.vn/ve-chung-toi",
    siteName: "Hợp Đồng Pháp Lý",
    locale: "vi_VN",
    type: "website",
  },
};

const advantages = [
  {
    icon: Search,
    title: "Dễ dàng tìm kiếm mẫu hợp đồng",
    description:
      "Hệ thống tài liệu được phân loại theo chủ đề và lĩnh vực, giúp người dùng thuận tiện tìm kiếm mẫu hợp đồng phù hợp với nhu cầu sử dụng.",
  },
  {
    icon: FileText,
    title: "Đa dạng biểu mẫu pháp lý",
    description:
      "Cung cấp các mẫu hợp đồng và biểu mẫu thuộc nhiều lĩnh vực khác nhau, phục vụ nhu cầu tham khảo và sử dụng của cá nhân, hộ kinh doanh và doanh nghiệp.",
  },
  {
    icon: ShieldCheck,
    title: "Chú trọng nội dung và tính ứng dụng",
    description:
      "Nội dung tài liệu được xây dựng theo hướng rõ ràng, có cấu trúc và chú trọng các điều khoản cần thiết, giúp người dùng thuận tiện tham khảo và điều chỉnh theo từng giao dịch.",
  },
  {
    icon: Download,
    title: "Tải tài liệu thuận tiện",
    description:
      "Hỗ trợ tải tài liệu dưới định dạng Word và PDF, giúp người dùng dễ dàng lưu trữ, tham khảo và chỉnh sửa nội dung khi cần thiết.",
  },
  {
    icon: RefreshCw,
    title: "Không ngừng cập nhật",
    description:
      "Các danh mục tài liệu được định hướng bổ sung và hoàn thiện thường xuyên nhằm đáp ứng nhu cầu sử dụng ngày càng đa dạng.",
  },
];

export default function AboutPage() {
  return (
    <LegalContent>
      <article className="space-y-10 text-slate-700">
        {/* Introduction */}
        <header className="border-b border-slate-100 pb-6">
          <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Về chúng tôi
          </h1>

          <p className="mt-4 text-sm leading-7 sm:text-base">
            Hợp Đồng Pháp Lý là nền tảng cung cấp mẫu hợp đồng và biểu mẫu pháp
            lý, được xây dựng nhằm giúp cá nhân và doanh nghiệp tiếp cận các tài
            liệu cần thiết một cách thuận tiện, tiết kiệm thời gian và dễ dàng
            sử dụng.
          </p>
        </header>

        {/* Mission */}
        <section aria-labelledby="mission-heading" className="space-y-4">
          <h2 id="mission-heading" className="text-xl font-bold text-slate-900">
            Sứ mệnh của Hợp Đồng Pháp Lý
          </h2>

          <p className="text-sm leading-7 sm:text-base">
            Trong hoạt động kinh doanh và các giao dịch dân sự, hợp đồng đóng
            vai trò quan trọng trong việc xác lập quyền, nghĩa vụ và trách nhiệm
            giữa các bên. Tuy nhiên, không phải cá nhân hay doanh nghiệp nào
            cũng có sẵn kiến thức và thời gian để tự xây dựng một văn bản hợp
            đồng phù hợp.
          </p>

          <p className="text-sm leading-7 sm:text-base">
            Việc tìm kiếm tài liệu trên Internet cũng có thể gặp khó khăn khi
            nội dung phân tán, thiếu hệ thống hoặc chưa đáp ứng đúng mục đích sử
            dụng. Điều này khiến người dùng mất nhiều thời gian trong việc tìm
            kiếm, tham khảo và hoàn thiện văn bản.
          </p>

          <p className="text-sm leading-7 sm:text-base">
            Xuất phát từ nhu cầu đó, Hợp Đồng Pháp Lý hướng đến việc xây dựng
            một thư viện biểu mẫu hợp đồng có tổ chức, dễ tiếp cận và thuận tiện
            sử dụng. Chúng tôi mong muốn trở thành nguồn tham khảo hữu ích, hỗ
            trợ người dùng chủ động hơn trong quá trình chuẩn bị các văn bản
            pháp lý cho công việc và cuộc sống.
          </p>
        </section>

        {/* Advantages */}
        <section aria-labelledby="advantages-heading" className="space-y-6">
          <div>
            <h2
              id="advantages-heading"
              className="text-xl font-bold text-slate-900"
            >
              Giá trị chúng tôi hướng đến
            </h2>

            <p className="mt-2 text-sm leading-7 sm:text-base">
              Hợp Đồng Pháp Lý tập trung phát triển trải nghiệm tra cứu và sử
              dụng tài liệu thông qua những giá trị thiết thực:
            </p>
          </div>

          <ul className="space-y-6">
            {advantages.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.title} className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <Icon
                      className="size-5 text-emerald-700"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-6 text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm leading-7 sm:text-base">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Vision */}
        <section
          aria-labelledby="vision-heading"
          className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 sm:p-6"
        >
          <h2 id="vision-heading" className="text-xl font-bold text-slate-900">
            Định hướng phát triển
          </h2>

          <p className="mt-3 text-sm leading-7 sm:text-base">
            Chúng tôi hướng đến việc phát triển Hợp Đồng Pháp Lý thành một nền
            tảng tài liệu pháp lý trực tuyến hữu ích, nơi người dùng có thể tìm
            kiếm, tham khảo và tiếp cận các biểu mẫu hợp đồng phù hợp với nhu
            cầu thực tế.
          </p>

          <p className="mt-3 text-sm leading-7 sm:text-base">
            Trong quá trình phát triển, chúng tôi sẽ tiếp tục hoàn thiện hệ
            thống tài liệu, cải thiện trải nghiệm sử dụng và nâng cao chất lượng
            nội dung để mang lại nhiều giá trị hơn cho cộng đồng.
          </p>
        </section>

        {/* Disclaimer */}
        <section
          aria-labelledby="disclaimer-heading"
          className="space-y-3 border-t border-slate-100 pt-7"
        >
          <h2
            id="disclaimer-heading"
            className="text-lg font-bold text-slate-900"
          >
            Lưu ý khi sử dụng tài liệu
          </h2>

          <p className="text-sm leading-7 sm:text-base">
            Các mẫu hợp đồng trên website có mục đích hỗ trợ tham khảo và chuẩn
            bị văn bản. Người sử dụng cần chủ động kiểm tra, bổ sung thông tin
            và điều chỉnh các điều khoản để phù hợp với tính chất giao dịch,
            thỏa thuận giữa các bên và quy định pháp luật hiện hành.
          </p>

          <p className="text-sm leading-7 sm:text-base">
            Đối với những giao dịch có tính chất phức tạp hoặc giá trị lớn,
            người dùng nên tham khảo ý kiến của luật sư hoặc chuyên gia pháp lý
            trước khi ký kết.
          </p>
        </section>

        {/* Commitment */}
        <section
          aria-labelledby="commitment-heading"
          className="space-y-3 border-t border-slate-100 pt-7"
        >
          <h2
            id="commitment-heading"
            className="text-lg font-bold text-slate-900"
          >
            Cam kết của chúng tôi
          </h2>

          <p className="text-sm leading-7 sm:text-base">
            Hợp Đồng Pháp Lý luôn hướng đến sự minh bạch trong việc cung cấp
            thông tin, rõ ràng trong quá trình sử dụng dịch vụ và không ngừng
            cải thiện chất lượng tài liệu.
          </p>

          <p className="text-sm leading-7 sm:text-base">
            Mọi ý kiến đóng góp và phản hồi từ người dùng đều là cơ sở quan
            trọng để chúng tôi hoàn thiện nền tảng và phục vụ tốt hơn những nhu
            cầu thực tế.
          </p>
        </section>
      </article>
    </LegalContent>
  );
}
