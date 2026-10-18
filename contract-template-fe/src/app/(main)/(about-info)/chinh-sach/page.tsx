const PolicyContent = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-10 space-y-6 text-slate-700 leading-relaxed">
      {/* Tiêu đề trang */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 pb-4 border-b border-slate-100">
        Chính sách hệ thống
      </h1>

      {/* 1. Chính sách bảo mật */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          1. Chính sách bảo mật
        </h2>
        <p className="text-sm md:text-base">
          Việc thu thập số điện thoại là tùy chọn nhằm xác minh tính chính xác
          của các yêu cầu và giao dịch trên hệ thống. Mục đích của việc này là
          đảm bảo các hành động được thực hiện bởi người dùng thực, đồng thời
          phục vụ công tác thống kê, hỗ trợ và tư vấn chỉnh sửa nội dung hợp
          đồng sau khi tải về.
        </p>
        <p className="text-sm md:text-base">
          Việc cung cấp số điện thoại được coi là sự đồng ý cho phép chúng tôi
          liên hệ lại để hỗ trợ khi cần thiết. Mọi thông tin cá nhân của người
          dùng sẽ được bảo mật và mã hóa bằng công nghệ SSL, chống lại mọi truy
          cập trái phép.
        </p>
      </section>

      {/* 2. Chính sách thanh toán */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          2. Chính sách thanh toán
        </h2>
        <p className="text-sm md:text-base">
          Hệ thống chấp nhận nhiều phương thức thanh toán, bao gồm: Mã QR liên
          ngân hàng, thẻ tín dụng, PayPal, và các ví điện tử như Momo, ZaloPay.
          Tất cả các giao dịch được thực hiện và kiểm soát chặt chẽ thông qua
          cổng thanh toán bảo mật.
        </p>
        <p className="text-sm md:text-base">
          Chúng tôi sẽ không chịu trách nhiệm và không hỗ trợ các trường hợp
          thanh toán không chính xác, bao gồm: thanh toán nhầm mã hợp đồng, nhầm
          loại hợp đồng hoặc sử dụng các phương thức không được liệt kê trên hệ
          thống. Mọi vấn đề phát sinh liên quan đến lỗi thanh toán hoặc lỗi tải
          mẫu hợp đồng, vui lòng liên hệ trực tiếp qua số điện thoại hỗ trợ hoặc
          gửi email đến hệ thống để được hỗ trợ kịp thời.
        </p>
      </section>

      {/* 3. Chính sách sử dụng dịch vụ */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          3. Chính sách sử dụng dịch vụ
        </h2>
        <p className="text-sm md:text-base">
          Các mẫu hợp đồng trên hệ thống được xây dựng và thẩm định bởi đội ngũ
          chuyên gia pháp lý và luật sư nhằm đảm bảo tính chính xác và giá trị
          thực tiễn.
        </p>
        <p className="text-sm md:text-base">
          Khi người dùng tải xuống tài liệu, việc sử dụng chỉ giới hạn cho mục
          đích cá nhân. Nghiêm cấm mọi hành vi sao chép, phân phối hoặc bán lại
          các mẫu hợp đồng này mà không có sự đồng ý bằng văn bản của đơn vị chủ
          quản hệ thống. Toàn bộ nội dung và hình thức của các mẫu hợp đồng đã
          được bảo hộ quyền sở hữu trí tuệ và bản quyền tác giả theo quy định
          của pháp luật hiện hành.
        </p>
      </section>

      {/* 4. Chính sách hỗ trợ khách hàng */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          4. Chính sách hỗ trợ khách hàng
        </h2>
        <p className="text-sm md:text-base">
          Hệ thống cho phép người dùng tìm kiếm, thanh toán và tải hợp đồng
          24/7, kể cả ngày nghỉ và ngày lễ. Tuy nhiên, việc hỗ trợ trực tiếp qua
          điện thoại, email hoặc chat sẽ được thực hiện trong giờ hành chính
          theo lịch làm việc của đơn vị chủ quản.
        </p>
        <p className="text-sm md:text-base">
          Chúng tôi cam kết phản hồi nhanh chóng mọi yêu cầu hỗ trợ ngay khi
          nhận được trong khung giờ làm việc. Để được tư vấn, hướng dẫn sử dụng
          hoặc điền mẫu hợp đồng, quý khách vui lòng liên hệ qua số điện thoại
          hỗ trợ.
        </p>
        <p className="text-sm md:text-base">
          Mọi khiếu nại, đóng góp ý kiến hoặc phản hồi về dịch vụ và chính sách
          xin vui lòng gửi email về địa chỉ{" "}
          <a
            href="mailto:info@luatthienma.com.vn"
            className="font-bold text-blue-600 hover:underline"
          >
            info@luatthienma.com.vn
          </a>
          . Chúng tôi sẽ tiếp nhận và xử lý trong thời gian sớm nhất.
        </p>
      </section>

      {/* 5. Chính sách về Quyền sở hữu trí tuệ */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          5. Chính sách về Quyền sở hữu trí tuệ
        </h2>
        <p className="text-sm md:text-base">
          Chúng tôi cam kết tuân thủ nghiêm ngặt các quy định pháp lý trong quá
          trình biên soạn, phát hành và cung cấp dịch vụ. Mọi hoạt động của hệ
          thống đều nhằm đảm bảo tối đa quyền và lợi ích hợp pháp của người
          dùng.
        </p>
        <p className="text-sm md:text-base">
          Toàn bộ tài sản trí tuệ của hệ thống, bao gồm ý tưởng, logo, giao
          diện, mã nguồn, tính năng website và tất cả các mẫu hợp đồng, văn bản
          đều đã được đăng ký bảo hộ nhãn hiệu và quyền tác giả tại Cục Sở hữu
          Trí tuệ Việt Nam.
        </p>
        <p className="text-sm md:text-base">
          Chúng tôi sẽ thực hiện các biện pháp pháp lý cần thiết đối với mọi
          hành vi sử dụng trái phép, sao chép hoặc gây tổn hại đến hệ thống.
        </p>
      </section>

      {/* Lời chào kết thúc */}
      <div className="pt-4 border-t border-slate-100 font-bold text-slate-900 text-sm md:text-base">
        Trân trọng!
      </div>
    </div>
  );
};

export default PolicyContent;
