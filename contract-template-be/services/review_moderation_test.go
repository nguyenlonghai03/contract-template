package services

import "testing"

func TestModerateReview(t *testing.T) {
	cases := []struct {
		name, author, comment string
		want                  ReviewRejectReason
	}{
		// Nội dung bình thường không được chặn nhầm (kể cả gõ không dấu).
		{"normal", "Nguyễn Văn A", "Mẫu hợp đồng rất chi tiết, dễ chỉnh sửa. Cảm ơn shop!", ReviewOK},
		{"no diacritics", "Tran B", "mau hop dong lon, cac dieu khoan day du, buoi toi tai ve dung luon", ReviewOK},
		{"negative but clean", "C", "Hợp đồng thiếu điều khoản phạt, hơi thất vọng. Tôi sợ bị lừa đảo khi thuê nhà", ReviewOK},
		{"sentence with dot", "D", "Rất ok. Me thích mẫu này. Co the dung ngay", ReviewOK},
		{"wear", "E", "con di hoc ve, do cho be, deo kinh doc hop dong", ReviewOK},
		{"earlobe", "F", "Dái tai tôi đỏ lên vì vui", ReviewOK},

		{"profanity accented", "G", "Mẫu như cứt", ReviewProfanity},
		{"profanity abbr", "H", "dcm mau gi te vl", ReviewProfanity},
		{"profanity phrase", "I", "đụ má web", ReviewProfanity},
		{"profanity upper", "J", "ĐỊT", ReviewProfanity},
		{"profanity in name", "Thằng chó", "Mẫu tốt", ReviewProfanity},
		{"profanity english", "K", "fuck this", ReviewProfanity},
		// NFD (macOS/iOS) vẫn phải bắt được.
		{"profanity NFD", "L", "cặc", ReviewProfanity},

		{"url http", "M", "Xem thêm tại https://abc.xyz", ReviewContainsURL},
		{"url domain", "N", "Vào abcxyz.com để mua rẻ hơn", ReviewContainsURL},
		{"url obfuscated", "O", "vao abc[.]vn nhe", ReviewContainsURL},
		{"url www", "P", "www.example", ReviewContainsURL},
		{"telegram", "Q", "Liên hệ t.me/spam", ReviewContainsURL},
		{"url in name", "shop.vn", "Mẫu tốt", ReviewContainsURL},

		{"phone in text", "R", "Cần làm hợp đồng gọi 0981 234 567", ReviewSpam},
		{"repeated chars", "S", "tốttttttttttttt", ReviewSpam},
		{"no letters", "T", "12345 !!! ...", ReviewSpam},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := ModerateReview(tc.author, tc.comment); got != tc.want {
				t.Errorf("ModerateReview(%q, %q) = %q, want %q", tc.author, tc.comment, got, tc.want)
			}
		})
	}
}
