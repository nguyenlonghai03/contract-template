package services

import (
	"regexp"
	"strings"
	"unicode"

	"golang.org/x/text/unicode/norm"
)

// Kiểm duyệt tự động cho đánh giá của khách: review hợp lệ được hiển thị ngay,
// chỉ chặn từ ngữ thô tục, đường link và nội dung spam.

type ReviewRejectReason string

const (
	ReviewOK          ReviewRejectReason = ""
	ReviewProfanity   ReviewRejectReason = "profanity"
	ReviewContainsURL ReviewRejectReason = "url"
	ReviewSpam        ReviewRejectReason = "spam"
)

// Từ thô tục CÓ DẤU: so khớp nguyên từ sau khi lowercase. Không bỏ dấu khi so
// vì bỏ dấu sẽ chặn nhầm từ thường ("lớn" → "lon", "các" → "cac", "đủ" → "du").
var profaneWords = map[string]bool{
	"địt": true, "đụ": true, "lồn": true, "buồi": true, "cặc": true, "đéo": true,
	"đĩ": true, "điếm": true, "cứt": true, "lìn": true, "cặk": true,
	"đcm": true, "đmm": true, "đkm": true, "đjt": true, "đcmm": true, "đmcs": true, "đcmn": true,
}

// Từ thô tục KHÔNG DẤU / viết tắt: chỉ khớp khi khách gõ đúng dạng không dấu này.
// Chỉ gồm các dạng không trùng với từ tiếng Việt bình thường khi gõ không dấu
// (vd KHÔNG có "lon" = lớn, "cac" = các, "du" = du lịch, "buoi" = buổi, "deo" = đeo).
var profaneASCIIWords = map[string]bool{
	"dit": true, "djt": true, "dcm": true, "dmm": true, "dkm": true, "dcmm": true,
	"cmm": true, "cmn": true, "clgt": true, "vcl": true, "vkl": true, "vl": true,
	"vcc": true, "dmcs": true, "loz": true, "cak": true,
	"fuck": true, "fucking": true, "fck": true, "shit": true, "bitch": true,
	"cunt": true, "dick": true, "pussy": true, "asshole": true, "motherfucker": true,
}

// Cụm từ thô tục (đã chuẩn hoá khoảng trắng, lowercase), khớp nguyên cụm.
var profanePhrases = []string{
	"đụ má", "đụ mẹ", "địt mẹ", "địt con", "đéo mẹ", "con đĩ", "mẹ mày", "má mày",
	"du ma", "du me", "dit me", "dit con", "deo me",
	"óc chó", "oc cho", "thằng chó", "đồ chó",
}

var (
	// http(s)://, www., hoặc chuỗi dạng tên miền (abc.com, abc.vn, bit.ly/xyz, abc[.]com...).
	// Không cho khoảng trắng quanh dấu chấm để không chặn nhầm câu thường ("ok. Me thích").
	urlPattern = regexp.MustCompile(`(?i)(https?://|www\.|\b[a-z0-9-]+(\.|\[\.\]|\(\.\)|\s+dot\s+)(com|net|org|vn|info|biz|xyz|top|site|online|link|club|shop|store|app|io|co|me|ly|gl|tk|ml|ga|cf|gq|ru|cn|cc|pw|ws|live|vip|win|bet|fun|tv|asia|pro|click|today|icu)\b)`)

	// Cùng 1 ký tự lặp >= 10 lần liên tiếp ("aaaaaaaaaa", "!!!!!!!!!!").
	repeatedCharLimit = 10

	// Liên hệ ngoài: telegram/zalo/... kèm handle, thường là quảng cáo.
	contactPattern = regexp.MustCompile(`(?i)(t\.me/|telegram|zalo\s*[:.]?\s*0\d{8,}|@[a-z0-9_]{4,})`)

	// Số điện thoại chèn trong nội dung (quảng cáo dịch vụ).
	phoneInTextPattern = regexp.MustCompile(`0[\s.\-]*[35789]([\s.\-]*\d){8}`)
)

// ModerateReview kiểm tra tên + nội dung đánh giá. Trả về ReviewOK nếu được phép hiển thị.
func ModerateReview(authorName, comment string) ReviewRejectReason {
	name := normalizeText(authorName)
	text := normalizeText(comment)

	for _, s := range []string{name, text} {
		if containsProfanity(s) {
			return ReviewProfanity
		}
	}

	for _, s := range []string{name, text} {
		if urlPattern.MatchString(s) || contactPattern.MatchString(s) {
			return ReviewContainsURL
		}
	}

	if phoneInTextPattern.MatchString(text) || hasRepeatedChars(text, repeatedCharLimit) || !hasLetters(text) {
		return ReviewSpam
	}

	return ReviewOK
}

// normalizeText: NFC (macOS/iOS có thể gửi dạng NFD), lowercase, gộp khoảng trắng.
func normalizeText(s string) string {
	s = norm.NFC.String(strings.ToLower(s))
	return strings.Join(strings.Fields(s), " ")
}

func containsProfanity(s string) bool {
	words := strings.FieldsFunc(s, func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r)
	})

	for _, w := range words {
		if profaneWords[w] || profaneASCIIWords[w] {
			return true
		}
	}

	// So cụm từ trên chuỗi đã tách từ, đệm khoảng trắng để chỉ khớp nguyên từ.
	joined := " " + strings.Join(words, " ") + " "
	for _, p := range profanePhrases {
		if strings.Contains(joined, " "+p+" ") {
			return true
		}
	}

	return false
}

func hasRepeatedChars(s string, limit int) bool {
	var prev rune
	run := 0
	for _, r := range s {
		if r == prev && !unicode.IsSpace(r) {
			run++
			if run >= limit {
				return true
			}
		} else {
			prev, run = r, 1
		}
	}
	return false
}

func hasLetters(s string) bool {
	for _, r := range s {
		if unicode.IsLetter(r) {
			return true
		}
	}
	return false
}
