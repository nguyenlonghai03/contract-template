import { CheckCircle2, ShieldCheck, Award, Users } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-10 space-y-6 text-slate-700 leading-relaxed">
      {/* Tiêu đề trang */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 pb-4 border-b border-slate-100">
        Về chúng tôi
      </h1>

      {/* Đoạn giới thiệu mở đầu */}
      <div className="space-y-4 text-sm md:text-base">
        <p>
          Mẫu Hợp Đồng tại website{" "}
          <span className="font-semibold text-blue-600">www.mauhopdong.vn</span>{" "}
          là một dự án thành viên trong chuỗi dự án pháp lý – công nghệ của{" "}
          <strong>Công ty Luật Thiên Mã</strong>, đơn vị luật sư thuộc Đoàn Luật
          sư thành phố Hà Nội. Các luật sư và đội ngũ phát triển dự án hiểu rằng
          người dùng hiện nay cần có một hệ thống mẫu hợp đồng chuyên nghiệp,
          chuẩn hóa, đúng luật và được rà soát đầy đủ từ các luật sư, chuyên gia
          pháp lý để an tâm sử dụng và ký kết. Từ đó hệ thống Mẫu Hợp Đồng được
          hình thành để đáp ứng các nhu cầu cấp thiết ấy.
        </p>

        <p>
          Mẫu Hợp Đồng ra đời nhằm giúp người dùng có công cụ pháp lý chuyên
          nghiệp, đúng quy định, hạn chế tối đa rủi ro pháp lý có thể gặp phải.
          Ngoài ra góp phần nâng cao năng lực quản trị rủi ro pháp lý cho doanh
          nghiệp và cá nhân có nhu cầu sử dụng. Thực tế cho thấy, trên nhiều nền
          tảng trực tuyến hiện nay, hợp đồng được đăng tải sơ sài, thiếu điều
          khoản quan trọng, chưa đúng quy định pháp luật. Việc sử dụng những hợp
          đồng này tiềm ẩn nhiều rủi ro và có thể gây thiệt hại nghiêm trọng khi
          phát sinh tranh chấp hoặc xung đột lợi ích. Nhất là các hợp đồng có
          giá trị ký kết cao hoặc dịch vụ, sản phẩm đặc thù.
        </p>
      </div>

      {/* Danh sách các điểm mới / ưu điểm nổi bật */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-slate-900">
          Dưới đây là các điểm mới được các luật sư và đội ngũ trú trọng phát
          triển:
        </h3>

        <ul className="space-y-3 text-sm md:text-base">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">
                Luật sư soạn thảo và rà soát:
              </strong>{" "}
              Đây là điểm quan trọng, nổi bật nhất bởi tất cả các hợp đồng phát
              hành đều được đội ngũ Luật sư kiểm duyệt và rà soát chuyên sâu qua
              nhiều bước.
            </div>
          </li>

          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">
                Số lượng hợp đồng lớn nhất Việt Nam:
              </strong>{" "}
              Ngay trong giai đoạn phát hành đầu tiên, chúng tôi đã biên soạn và
              cung cấp trên 10.000 hợp đồng thuộc mọi ngành nghề và lĩnh vực.
            </div>
          </li>

          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Đa dạng ngôn ngữ:</strong>{" "}
              Ngoài hợp đồng tiếng Việt chuẩn, chúng tôi còn phát hành hợp đồng
              song ngữ, hợp đồng tiếng Anh và nhiều hợp đồng bằng các ngôn ngữ
              nước ngoài khác, phù hợp nhu cầu sử dụng tại Việt Nam.
            </div>
          </li>

          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Hướng dẫn chi tiết:</strong>{" "}
              Mỗi hợp đồng đều kèm theo hướng dẫn ngắn gọn, súc tích, như những
              tư vấn thực tiễn từ luật sư và chuyên gia pháp lý.
            </div>
          </li>

          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">
                Chuẩn mực về độ dài và chuyên sâu:
              </strong>{" "}
              Mỗi hợp đồng đều có độ dài, phần nội dung đầy đủ, có những hợp
              đồng chuyên sâu lên đến 30 trang văn bản. Đặc biệt, chúng tôi cung
              cấp các hợp đồng đặc thù theo từng lĩnh vực chuyên ngành – những
              mẫu hợp đồng chất lượng cao mà chỉ có tại Mẫu Hợp Đồng.
            </div>
          </li>

          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Cập nhật liên tục:</strong> Hệ
              thống thường xuyên update, bổ sung hợp đồng mới và điều chỉnh nội
              dung phù hợp với những thay đổi của pháp luật.
            </div>
          </li>

          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">
                Hỗ trợ tư vấn và soạn thảo:
              </strong>{" "}
              Trong mỗi hợp đồng mẫu khi người dùng cần sự hỗ trợ của Luật sư để
              hiệu đính, điều chỉnh sao cho phù hợp đều được hệ thống hỗ trợ và
              kết nối nhanh.
            </div>
          </li>
        </ul>
      </div>

      {/* Đoạn kết luận / Lời ngỏ */}
      <div className="pt-4 border-t border-slate-100 text-sm md:text-base">
        <p>
          Chúng tôi hiểu rằng việc biên soạn, ban hành và tái bản với số lượng
          lớn không thể tránh khỏi những hạn chế về học thuật, chuyên môn hoặc
          yếu tố khách quan khác. Là đơn vị sự xây dựng và phát triển hệ thống
          chúng tôi trân trọng ghi nhận mọi góp ý, phản hồi từ quý độc giả,
          người dùng và các nhà nghiên cứu. Sự đóng góp của các bạn là nền tảng
          để chúng tôi tiếp tục hoàn thiện, mang đến những sản phẩm pháp lý chất
          lượng và chuyên nghiệp nhất./.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
