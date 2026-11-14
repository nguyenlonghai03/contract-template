import type { Metadata } from "next";
import {
  FileText,
  Scale,
  UserCheck,
  Server,
  CreditCard,
  AlertCircle,
} from "lucide-react";

import LegalContent from "@/components/ve-chung-toi/LegalContent";

export const metadata: Metadata = {
  title: "Miễn trừ trách nhiệm | Hợp Đồng Pháp Lý",
  description:
    "Tìm hiểu các quy định miễn trừ trách nhiệm khi tham khảo, mua và sử dụng mẫu hợp đồng, biểu mẫu pháp lý tại Hợp Đồng Pháp Lý.",
  alternates: {
    canonical: "https://hopdongphaply.vn/mien-tru-trach-nhiem",
  },
  openGraph: {
    title: "Miễn trừ trách nhiệm | Hợp Đồng Pháp Lý",
    description:
      "Các quy định về phạm vi trách nhiệm, sử dụng tài liệu, thanh toán và dịch vụ tại Hợp Đồng Pháp Lý.",
    url: "https://hopdongphaply.vn/mien-tru-trach-nhiem",
    siteName: "Hợp Đồng Pháp Lý",
    locale: "vi_VN",
    type: "website",
  },
};

const disclaimerSections = [
  {
    icon: FileText,
    title: "1. Phạm vi và mục đích cung cấp tài liệu",
    paragraphs: [
      "Hợp Đồng Pháp Lý cung cấp các mẫu hợp đồng, biểu mẫu pháp lý và tài liệu liên quan nhằm hỗ trợ cá nhân, tổ chức và doanh nghiệp trong quá trình tìm kiếm, tham khảo và chuẩn bị các văn bản phục vụ nhu cầu thực tế.",
      "Các tài liệu được cung cấp trên website có tính chất tham khảo và hỗ trợ soạn thảo. Việc mua hoặc tải xuống tài liệu không đồng nghĩa với việc người dùng đã được cung cấp dịch vụ tư vấn pháp lý riêng cho một giao dịch hoặc vụ việc cụ thể.",
      "Hợp Đồng Pháp Lý không phải là cơ quan nhà nước và các tài liệu do website cung cấp không mặc nhiên được xem là văn bản, biểu mẫu chính thức do cơ quan nhà nước ban hành.",
    ],
  },
  {
    icon: Scale,
    title: "2. Trách nhiệm về việc sử dụng tài liệu",
    paragraphs: [
      "Mỗi giao dịch và quan hệ pháp lý có thể có những đặc điểm, điều kiện và yêu cầu khác nhau. Vì vậy, một mẫu hợp đồng chung có thể không đáp ứng đầy đủ mọi tình huống thực tế.",
      "Người sử dụng có trách nhiệm đọc kỹ nội dung, kiểm tra thông tin, bổ sung các điều khoản cần thiết và điều chỉnh tài liệu sao cho phù hợp với mục đích giao dịch, thỏa thuận giữa các bên và quy định pháp luật áp dụng.",
      "Hợp Đồng Pháp Lý không bảo đảm rằng việc sử dụng nguyên trạng bất kỳ mẫu hợp đồng nào cũng sẽ phù hợp với mọi trường hợp hoặc tự động bảo vệ đầy đủ quyền và lợi ích hợp pháp của người sử dụng.",
      "Đối với các giao dịch có giá trị lớn, nội dung phức tạp hoặc tiềm ẩn rủi ro pháp lý, người sử dụng nên tham khảo ý kiến luật sư hoặc chuyên gia pháp lý trước khi ký kết và thực hiện.",
    ],
  },
  {
    icon: UserCheck,
    title: "3. Trách nhiệm của người sử dụng",
    paragraphs: [
      "Khi truy cập, mua hoặc tải tài liệu từ website, người sử dụng có trách nhiệm cung cấp thông tin chính xác trong quá trình giao dịch và sử dụng tài liệu đúng mục đích, phù hợp với quy định pháp luật.",
      "Người sử dụng cần chủ động kiểm tra tính phù hợp của nội dung tài liệu trước khi đưa vào sử dụng, đặc biệt đối với thông tin về chủ thể giao dịch, đối tượng hợp đồng, giá trị giao dịch, quyền và nghĩa vụ của các bên, thời hạn và điều kiện thực hiện.",
      "Người sử dụng tự chịu trách nhiệm đối với các quyết định, thỏa thuận và việc áp dụng tài liệu vào giao dịch cụ thể của mình, trong phạm vi trách nhiệm được pháp luật quy định.",
    ],
  },
  {
    icon: AlertCircle,
    title: "4. Cập nhật pháp luật và nội dung tài liệu",
    paragraphs: [
      "Nội dung các mẫu hợp đồng được xây dựng dựa trên mục đích sử dụng và các quy định pháp luật có liên quan tại thời điểm biên soạn hoặc cập nhật.",
      "Hệ thống pháp luật có thể thay đổi thông qua việc ban hành, sửa đổi, bổ sung hoặc thay thế các văn bản quy phạm pháp luật. Những thay đổi này có thể ảnh hưởng đến nội dung, căn cứ pháp lý hoặc cách áp dụng một số điều khoản trong tài liệu.",
      "Hợp Đồng Pháp Lý hướng đến việc rà soát và cập nhật tài liệu khi cần thiết. Tuy nhiên, người sử dụng vẫn cần chủ động kiểm tra các quy định pháp luật hiện hành tại thời điểm sử dụng và không nên mặc định rằng mọi tài liệu đều đã phản ánh đầy đủ những thay đổi pháp luật mới nhất.",
    ],
  },
  {
    icon: Server,
    title: "5. Trách nhiệm đối với hoạt động của hệ thống",
    paragraphs: [
      "Hợp Đồng Pháp Lý nỗ lực duy trì hoạt động ổn định, bảo đảm khả năng truy cập và cung cấp tài liệu cho người dùng. Tuy nhiên, website có thể phát sinh gián đoạn tạm thời do bảo trì, nâng cấp, lỗi kỹ thuật, sự cố đường truyền Internet hoặc các nguyên nhân khách quan nằm ngoài khả năng kiểm soát hợp lý.",
      "Trong những trường hợp cần thiết, chúng tôi có thể tạm thời giới hạn hoặc gián đoạn một số chức năng để bảo trì, khắc phục sự cố hoặc bảo đảm an toàn hệ thống.",
      "Chúng tôi sẽ nỗ lực khắc phục sự cố trong thời gian hợp lý và hỗ trợ khách hàng bị ảnh hưởng trong quá trình thanh toán hoặc tải tài liệu. Trách nhiệm xử lý các yêu cầu cụ thể được thực hiện theo chính sách dịch vụ và quy định pháp luật có liên quan.",
    ],
  },
  {
    icon: CreditCard,
    title: "6. Giá bán, thanh toán và tải tài liệu",
    paragraphs: [
      "Giá bán của từng mẫu hợp đồng và biểu mẫu pháp lý được công bố trên website và có thể được điều chỉnh theo từng thời điểm. Mức giá áp dụng cho giao dịch là mức giá được hiển thị tại thời điểm khách hàng xác nhận thanh toán.",
      "Khách hàng có trách nhiệm kiểm tra thông tin đơn hàng, số tiền thanh toán và nội dung tài liệu trước khi thực hiện giao dịch.",
      "Trong trường hợp đã thanh toán nhưng chưa nhận được tài liệu, phát sinh lỗi giao dịch hoặc không thể tải xuống do sự cố hệ thống, khách hàng có thể liên hệ với chúng tôi để được kiểm tra và hỗ trợ.",
      "Việc xử lý các yêu cầu hoàn tiền, thanh toán nhầm hoặc giao dịch không thành công được thực hiện theo Chính sách thanh toán và hoàn tiền được công bố trên website.",
    ],
  },
];

export default function DisclaimerContent() {
  return (
    <LegalContent>
      <article className="space-y-8 text-slate-700">
        {/* Header */}
        <header className="border-b border-slate-100 pb-6">
          <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Miễn trừ trách nhiệm
          </h1>

          <p className="mt-4 text-sm leading-7 sm:text-base">
            Các quy định dưới đây nhằm làm rõ phạm vi trách nhiệm của Hợp Đồng
            Pháp Lý và người sử dụng khi truy cập, tham khảo, mua và sử dụng các
            mẫu hợp đồng, biểu mẫu pháp lý được cung cấp trên website.
          </p>

          <p className="mt-3 text-sm leading-7 sm:text-base">
            Bằng việc tiếp tục truy cập và sử dụng website, người dùng được
            khuyến nghị đọc kỹ và tìm hiểu các nội dung miễn trừ trách nhiệm
            dưới đây.
          </p>
        </header>

        {/* Sections */}
        {disclaimerSections.map((section) => {
          const Icon = section.icon;

          return (
            <section
              key={section.title}
              className="space-y-4"
              aria-labelledby={`section-${section.title}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <Icon
                    className="size-5 text-emerald-700"
                    aria-hidden="true"
                  />
                </div>

                <h2
                  id={`section-${section.title}`}
                  className="pt-1 text-lg font-bold leading-7 text-slate-900 sm:text-xl"
                >
                  {section.title}
                </h2>
              </div>

              <div className="space-y-3 pl-0 sm:pl-12">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-7 sm:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          );
        })}

        {/* Contact */}
        <section
          aria-labelledby="contact-heading"
          className="space-y-3 border-t border-slate-100 pt-7"
        >
          <h2
            id="contact-heading"
            className="text-lg font-bold text-slate-900 sm:text-xl"
          >
            7. Liên hệ và hỗ trợ
          </h2>

          <p className="text-sm leading-7 sm:text-base">
            Nếu có thắc mắc liên quan đến nội dung tài liệu, giao dịch thanh
            toán hoặc quá trình sử dụng website, người dùng có thể liên hệ với
            Hợp Đồng Pháp Lý thông qua các thông tin liên hệ được công bố trên
            website để được hỗ trợ.
          </p>
        </section>

        {/* Final notice */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <p className="text-sm leading-7 text-slate-600 sm:text-base">
            Hợp Đồng Pháp Lý có thể điều chỉnh nội dung miễn trừ trách nhiệm để
            phù hợp với hoạt động cung cấp dịch vụ và các quy định pháp luật
            hiện hành. Những nội dung cập nhật sẽ được công bố trên website.
          </p>
        </div>

        <p className="border-t border-slate-100 pt-5 text-sm font-semibold text-slate-900">
          Trân trọng cảm ơn quý khách đã tin tưởng và sử dụng Hợp Đồng Pháp Lý.
        </p>
      </article>
    </LegalContent>
  );
}
