const DisclaimerContent = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-10 space-y-6 text-slate-700 leading-relaxed">
      {/* Tiêu đề trang */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 pb-4 border-b border-slate-100">
        Miễn trừ trách nhiệm
      </h1>

      {/* 1. Miễn trừ trách nhiệm về nội dung */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          1. Miễn trừ trách nhiệm về nội dung
        </h2>
        <p className="text-sm md:text-base">
          Mẫu hợp đồng và các nội dung kèm theo được đăng tải trên website này
          do chúng tôi xây dựng và biên soạn nhằm mục đích cung cấp tài liệu
          tham khảo và hướng dẫn cách soạn thảo, áp dụng hợp đồng trong thực
          tiễn.
        </p>
        <p className="text-sm md:text-base">
          Chúng tôi không bán, không phát hành và không đại diện cho bất kỳ cơ
          quan nhà nước nào trong việc cung cấp mẫu hợp đồng mang tính pháp lý
          bắt buộc hoặc mẫu bản hành chính thức của cơ quan nhà nước. Người sử
          dụng có trách nhiệm tự rà soát, điều chỉnh và chịu trách nhiệm về việc
          áp dụng nội dung hợp đồng cho từng trường hợp cụ thể.
        </p>
      </section>

      {/* 2. Miễn trừ trách nhiệm về pháp lý */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          2. Miễn trừ trách nhiệm về pháp lý
        </h2>
        <p className="text-sm md:text-base">
          Việc sử dụng các mẫu hợp đồng và hướng dẫn đi kèm không thể thay thế
          cho dịch vụ tư vấn pháp lý chuyên nghiệp từ luật sư hoặc chuyên gia.
          Người dùng và khách hàng được khuyến nghị tìm kiếm sự trợ giúp pháp lý
          để đảm bảo việc sử dụng các tài liệu một cách hiệu quả và chính xác
          nhất.
        </p>
        <p className="text-sm md:text-base">
          Mẫu hợp đồng được xây dựng trên cơ sở các quy định pháp luật hiện hành
          tại thời điểm đăng tải. Chúng tôi không chịu trách nhiệm đối với mọi
          thay đổi, sửa đổi, bổ sung hoặc việc hết hiệu lực của các căn cứ pháp
          luật được dẫn chiếu sau thời điểm đăng tải, kể cả trong trường hợp các
          thay đổi đó có thể ảnh hưởng đến nội dung hoặc hiệu lực pháp lý của
          hợp đồng.
        </p>
      </section>

      {/* 3. Miễn trừ trách nhiệm về sự cố */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          3. Miễn trừ trách nhiệm về sự cố
        </h2>
        <p className="text-sm md:text-base">
          Hệ thống có thể gặp các sự cố kỹ thuật, được bảo trì hoặc nâng cấp
          định kỳ mà không cần thông báo trước. Chúng tôi sẽ không chịu trách
          nhiệm đối với bất kỳ thiệt hại nào phát sinh từ việc gián đoạn dịch vụ
          này.
        </p>
        <p className="text-sm md:text-base">
          Trong trường hợp thời gian cập nhật kéo dài quá hai (02) giờ, chúng
          tôi sẽ thông báo trên trang chủ và cảnh báo khi người dùng truy cập.
          Đối với các lỗi phát sinh trong quá trình tải hoặc thanh toán do sự cố
          kỹ thuật của hệ thống, chúng tôi cam kết hỗ trợ người dùng tải tài
          liệu trực tiếp từ máy chủ hoặc hoàn trả chi phí đã thanh toán (nếu
          có).
        </p>
      </section>

      {/* 4. Miễn trừ trách nhiệm về giá tải */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          4. Miễn trừ trách nhiệm về giá tải
        </h2>
        <p className="text-sm md:text-base">
          Giá tải về của các mẫu hợp đồng có thể thay đổi mà không cần thông báo
          trước. Mức giá chính thức sẽ được hiển thị ngay tại thời điểm người
          dùng thực hiện thao tác tải về.
        </p>
        <p className="text-sm md:text-base">
          Việc điều chỉnh giá không làm ảnh hưởng đến chất lượng của các mẫu hợp
          đồng hoặc trải nghiệm của người dùng trên hệ thống.
        </p>
      </section>

      {/* Lời chào kết thúc */}
      <div className="pt-4 border-t border-slate-100 font-bold text-slate-900 text-sm md:text-base">
        Trân trọng!
      </div>
    </div>
  );
};

export default DisclaimerContent;
