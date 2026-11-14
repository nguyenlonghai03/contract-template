import type { Metadata } from "next";
import {
  ShieldCheck,
  CreditCard,
  FileText,
  Headphones,
  Copyright,
  UserCheck,
  RefreshCw,
} from "lucide-react";

import LegalContent from "@/components/ve-chung-toi/LegalContent";

export const metadata: Metadata = {
  title: "Chính sách hệ thống | Hợp Đồng Pháp Lý",
  description:
    "Tìm hiểu chính sách bảo mật thông tin, thanh toán, sử dụng tài liệu, hỗ trợ khách hàng và quyền sở hữu trí tuệ tại Hợp Đồng Pháp Lý.",
  alternates: {
    canonical: "https://hopdongphaply.vn/chinh-sach-he-thong",
  },
  openGraph: {
    title: "Chính sách hệ thống | Hợp Đồng Pháp Lý",
    description:
      "Các chính sách và quy định khi sử dụng dịch vụ, mua và tải mẫu hợp đồng tại Hợp Đồng Pháp Lý.",
    url: "https://hopdongphaply.vn/chinh-sach-he-thong",
    siteName: "Hợp Đồng Pháp Lý",
    locale: "vi_VN",
    type: "website",
  },
};

const policySections = [
  {
    id: "privacy-policy",
    icon: ShieldCheck,
    title: "1. Chính sách bảo mật thông tin",
    paragraphs: [
      "Hợp Đồng Pháp Lý tôn trọng quyền riêng tư và có trách nhiệm bảo vệ thông tin cá nhân của khách hàng trong quá trình truy cập, tìm kiếm, mua và sử dụng tài liệu trên website.",
      "Tùy theo chức năng và nhu cầu giao dịch, chúng tôi có thể thu thập một số thông tin cần thiết như họ tên, số điện thoại, địa chỉ email, thông tin đơn hàng và dữ liệu liên quan đến quá trình thanh toán.",
      "Thông tin được thu thập nhằm phục vụ các mục đích như xác nhận giao dịch, cung cấp tài liệu, hỗ trợ khách hàng, xử lý yêu cầu phát sinh, bảo đảm an toàn hệ thống và thực hiện các nghĩa vụ theo quy định pháp luật.",
      "Chúng tôi không chủ động mua bán hoặc trao đổi thông tin cá nhân của khách hàng vì mục đích thương mại trái với quy định pháp luật. Việc cung cấp thông tin cho bên thứ ba chỉ được thực hiện trong phạm vi cần thiết để xử lý giao dịch, vận hành dịch vụ hoặc theo yêu cầu hợp pháp của cơ quan có thẩm quyền.",
      "Hợp Đồng Pháp Lý áp dụng các biện pháp phù hợp nhằm bảo vệ thông tin khỏi nguy cơ truy cập, sử dụng, tiết lộ hoặc thay đổi trái phép. Tuy nhiên, không có phương thức truyền tải hoặc lưu trữ dữ liệu nào có thể bảo đảm an toàn tuyệt đối trong mọi trường hợp.",
      "Khách hàng có quyền yêu cầu kiểm tra, cập nhật hoặc thực hiện các quyền khác đối với dữ liệu cá nhân theo quy định pháp luật và Chính sách bảo mật được công bố trên website.",
    ],
  },
  {
    id: "payment-policy",
    icon: CreditCard,
    title: "2. Chính sách thanh toán",
    paragraphs: [
      "Hợp Đồng Pháp Lý cung cấp dịch vụ mua và tải mẫu hợp đồng trực tuyến. Khách hàng có thể thực hiện thanh toán thông qua các phương thức được công bố và hỗ trợ tại thời điểm giao dịch.",
      "Đối với phương thức chuyển khoản ngân hàng bằng mã QR, khách hàng cần kiểm tra chính xác thông tin thanh toán, số tiền và nội dung chuyển khoản theo hướng dẫn của hệ thống.",
      "Sau khi hệ thống xác nhận thanh toán thành công, khách hàng có thể nhận quyền truy cập và tải tài liệu tương ứng với đơn hàng theo hướng dẫn trên website.",
      "Khách hàng có trách nhiệm kiểm tra thông tin đơn hàng trước khi thanh toán. Trường hợp chuyển khoản sai nội dung, sai số tiền, thanh toán trùng hoặc phát sinh giao dịch chưa được ghi nhận, khách hàng vui lòng liên hệ với chúng tôi để được kiểm tra và hỗ trợ.",
      "Chúng tôi không yêu cầu khách hàng thực hiện thanh toán thông qua các tài khoản hoặc phương thức không được công bố trên hệ thống. Khách hàng nên lưu lại thông tin giao dịch để thuận tiện đối chiếu khi cần thiết.",
      "Các vấn đề liên quan đến giao dịch, thanh toán và hoàn tiền được xử lý theo Chính sách thanh toán và hoàn tiền của Hợp Đồng Pháp Lý cùng các quy định pháp luật có liên quan.",
    ],
  },
  {
    id: "service-policy",
    icon: FileText,
    title: "3. Chính sách sử dụng tài liệu và dịch vụ",
    paragraphs: [
      "Các mẫu hợp đồng và biểu mẫu pháp lý được cung cấp trên website nhằm hỗ trợ cá nhân, tổ chức và doanh nghiệp tham khảo, chuẩn bị và hoàn thiện các văn bản phục vụ nhu cầu thực tế.",
      "Khách hàng có thể sử dụng tài liệu đã mua để tham khảo, chỉnh sửa thông tin và phục vụ các giao dịch, hoạt động hợp pháp của cá nhân hoặc tổ chức mình.",
      "Việc mua và tải tài liệu không đồng nghĩa với việc khách hàng được chuyển giao quyền sở hữu trí tuệ đối với tài liệu hoặc được tự do khai thác, phân phối tài liệu cho mục đích thương mại.",
      "Nghiêm cấm các hành vi sao chép, phát hành lại, đăng tải công khai, phân phối, kinh doanh hoặc bán lại tài liệu dưới hình thức độc lập khi chưa được chủ sở hữu quyền hợp pháp cho phép, trừ trường hợp pháp luật có quy định khác.",
      "Khách hàng cần đọc kỹ nội dung và chủ động điều chỉnh các điều khoản để phù hợp với từng giao dịch cụ thể. Các mẫu hợp đồng không mặc nhiên thay thế dịch vụ tư vấn pháp lý riêng cho từng trường hợp.",
      "Hợp Đồng Pháp Lý có quyền cập nhật, bổ sung hoặc điều chỉnh nội dung tài liệu và các tính năng của hệ thống nhằm nâng cao chất lượng dịch vụ. Những thay đổi này không làm mất đi các quyền hợp pháp của khách hàng theo giao dịch đã thực hiện.",
    ],
  },
  {
    id: "customer-support",
    icon: Headphones,
    title: "4. Chính sách hỗ trợ khách hàng",
    paragraphs: [
      "Hợp Đồng Pháp Lý hướng đến việc cung cấp trải nghiệm tìm kiếm, thanh toán và tải tài liệu trực tuyến thuận tiện. Khách hàng có thể truy cập website để tìm hiểu thông tin và thực hiện giao dịch theo khả năng hoạt động của hệ thống.",
      "Chúng tôi tiếp nhận các yêu cầu hỗ trợ liên quan đến việc tìm kiếm tài liệu, thông tin đơn hàng, xác nhận thanh toán, lỗi tải file và các vấn đề kỹ thuật phát sinh trong quá trình sử dụng dịch vụ.",
      "Đối với trường hợp khách hàng đã thanh toán thành công nhưng chưa nhận được tài liệu hoặc không thể tải xuống, chúng tôi sẽ kiểm tra thông tin giao dịch và hướng dẫn phương án xử lý phù hợp.",
      "Các yêu cầu hỗ trợ được tiếp nhận thông qua những kênh liên hệ được công bố trên website. Thời gian phản hồi phụ thuộc vào nội dung yêu cầu, tình trạng hệ thống và thời gian làm việc của bộ phận hỗ trợ.",
      "Khách hàng nên cung cấp mã đơn hàng và thông tin giao dịch cần thiết khi gửi yêu cầu hỗ trợ để chúng tôi có thể kiểm tra và xử lý nhanh chóng.",
      "Đối với các phản ánh, khiếu nại hoặc góp ý về chất lượng tài liệu và dịch vụ, chúng tôi sẽ tiếp nhận, xem xét và phản hồi trong thời gian hợp lý.",
    ],
  },
  {
    id: "intellectual-property",
    icon: Copyright,
    title: "5. Chính sách về quyền sở hữu trí tuệ",
    paragraphs: [
      "Tên thương hiệu Hợp Đồng Pháp Lý, logo, hình ảnh, thiết kế giao diện, nội dung giới thiệu, mã nguồn và các thành phần sáng tạo khác trên website có thể thuộc quyền sở hữu của chúng tôi hoặc được sử dụng hợp pháp theo sự cho phép của chủ sở hữu tương ứng.",
      "Đối với các mẫu hợp đồng và biểu mẫu pháp lý, quyền sở hữu trí tuệ được xác định theo quy định pháp luật hiện hành và phạm vi quyền hợp pháp của từng chủ thể. Việc mua tài liệu chỉ trao cho khách hàng quyền sử dụng trong phạm vi được cho phép, không mặc nhiên chuyển giao quyền tác giả hoặc các quyền sở hữu trí tuệ liên quan.",
      "Khách hàng không được tự ý sao chép, chỉnh sửa nhằm phát hành lại, phân phối hoặc khai thác thương mại các thành phần thuộc quyền sở hữu trí tuệ của người khác khi chưa có sự đồng ý hợp pháp, trừ các trường hợp được pháp luật cho phép.",
      "Chúng tôi tôn trọng quyền sở hữu trí tuệ của tổ chức và cá nhân. Nếu phát hiện nội dung có dấu hiệu xâm phạm quyền hoặc có căn cứ cho rằng quyền sở hữu trí tuệ của mình bị ảnh hưởng, các bên có thể gửi thông tin và tài liệu liên quan để được tiếp nhận, xem xét.",
    ],
  },
  {
    id: "user-responsibility",
    icon: UserCheck,
    title: "6. Trách nhiệm và quyền của người sử dụng",
    paragraphs: [
      "Khách hàng có trách nhiệm cung cấp thông tin chính xác khi thực hiện giao dịch, bảo mật các thông tin truy cập và chủ động kiểm tra nội dung tài liệu trước khi sử dụng.",
      "Người sử dụng không được thực hiện các hành vi gây ảnh hưởng đến hoạt động bình thường của website như can thiệp trái phép vào hệ thống, khai thác lỗ hổng bảo mật, phát tán mã độc hoặc sử dụng dịch vụ cho mục đích vi phạm pháp luật.",
      "Khách hàng có quyền tìm kiếm, tham khảo, mua và tải tài liệu theo các điều kiện được công bố trên website; đồng thời có quyền yêu cầu hỗ trợ, phản ánh hoặc khiếu nại khi quyền và lợi ích hợp pháp của mình bị ảnh hưởng.",
      "Hợp Đồng Pháp Lý có quyền áp dụng các biện pháp cần thiết để bảo vệ hệ thống, xử lý hành vi vi phạm và hạn chế việc sử dụng dịch vụ trái quy định, phù hợp với pháp luật hiện hành.",
    ],
  },
  {
    id: "policy-updates",
    icon: RefreshCw,
    title: "7. Điều chỉnh và cập nhật chính sách",
    paragraphs: [
      "Hợp Đồng Pháp Lý có thể điều chỉnh, bổ sung nội dung chính sách nhằm phù hợp với sự thay đổi trong hoạt động cung cấp dịch vụ, công nghệ vận hành và các quy định pháp luật có liên quan.",
      "Các nội dung cập nhật sẽ được công bố trên website. Khách hàng nên thường xuyên tham khảo để nắm rõ những quy định đang được áp dụng.",
      "Đối với những thay đổi có ảnh hưởng đến quyền và lợi ích của khách hàng, chúng tôi sẽ thực hiện việc thông báo hoặc xin ý kiến khi cần thiết theo quy định pháp luật.",
    ],
  },
];

export default function PolicyContent() {
  return (
    <LegalContent>
      <article className="space-y-8 text-slate-700">
        {/* Header */}
        <header className="border-b border-slate-100 pb-6">
          <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Chính sách hệ thống
          </h1>

          <p className="mt-4 text-sm leading-7 sm:text-base">
            Chính sách hệ thống quy định các nguyên tắc và điều kiện áp dụng khi
            khách hàng truy cập, sử dụng dịch vụ, mua và tải mẫu hợp đồng tại
            Hợp Đồng Pháp Lý.
          </p>

          <p className="mt-3 text-sm leading-7 sm:text-base">
            Chúng tôi xây dựng các chính sách này nhằm bảo đảm tính minh bạch
            trong quá trình cung cấp dịch vụ, bảo vệ quyền và lợi ích hợp pháp
            của khách hàng cũng như duy trì hoạt động ổn định của hệ thống.
          </p>
        </header>

        {/* Policy Sections */}
        {policySections.map((section) => {
          const Icon = section.icon;

          return (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              className="scroll-mt-24 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <Icon
                    className="size-5 text-emerald-700"
                    aria-hidden="true"
                  />
                </div>

                <h2
                  id={`${section.id}-heading`}
                  className="pt-1 text-lg font-bold leading-7 text-slate-900 sm:text-xl"
                >
                  {section.title}
                </h2>
              </div>

              <div className="space-y-3">
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
          id="policy-contact"
          aria-labelledby="policy-contact-heading"
          className="space-y-3 border-t border-slate-100 pt-7"
        >
          <h2
            id="policy-contact-heading"
            className="text-lg font-bold text-slate-900 sm:text-xl"
          >
            8. Thông tin liên hệ
          </h2>

          <p className="text-sm leading-7 sm:text-base">
            Nếu có bất kỳ thắc mắc, phản ánh hoặc yêu cầu hỗ trợ nào liên quan
            đến các chính sách trên, khách hàng vui lòng liên hệ với Hợp Đồng
            Pháp Lý thông qua thông tin liên hệ được công bố trên website.
          </p>
        </section>

        {/* Footer */}
        <footer className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <p className="text-sm leading-7 text-slate-600 sm:text-base">
            Việc sử dụng website và các dịch vụ của Hợp Đồng Pháp Lý được thực
            hiện trên cơ sở tuân thủ các chính sách được công bố, các thỏa thuận
            liên quan và quy định pháp luật hiện hành.
          </p>
        </footer>

        <p className="border-t border-slate-100 pt-5 text-sm font-semibold text-slate-900">
          Trân trọng cảm ơn quý khách đã tin tưởng và sử dụng Hợp Đồng Pháp Lý.
        </p>
      </article>
    </LegalContent>
  );
}
