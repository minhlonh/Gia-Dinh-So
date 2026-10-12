// Mỗi từ khóa là [tiếng Việt, tiếng Anh]
export type Bi = readonly [string, string];

const DECADES: Record<number, Bi[]> = {
  1940: [
    ["giếng làng", "the village well"], ["đèn dầu", "the oil lamp"],
    ["cơm độn khoai sắn", "rice mixed with cassava"], ["chợ phiên", "market day"],
    ["đò ngang", "the river ferry"], ["áo bà ba", "the ba ba shirt"],
    ["hát ru", "lullabies"], ["mùa gặt", "harvest season"],
  ],
  1950: [
    ["trường làng", "the village school"], ["bảng đá và phấn", "slate and chalk"],
    ["chợ Tết", "the Tet market"], ["đê sông", "the river dike"],
    ["bánh chưng đêm giao thừa", "banh chung on New Year's Eve"], ["chiếc nón lá", "the conical hat"],
    ["nồi cơm bếp củi", "rice cooked on a wood fire"], ["chuyện kể bên bà", "stories by grandma's side"],
  ],
  1960: [
    ["chiếc đài radio", "the radio"], ["tem phiếu gạo", "rice ration coupons"],
    ["xe đạp Phượng Hoàng", "the Phoenix bicycle"], ["thư viết tay", "handwritten letters"],
    ["chợ quê", "the country market"], ["lớp học buổi tối", "evening classes"],
    ["bài hát cả nhà cùng hát", "songs the whole family sang"], ["chiếc bàn học", "the study desk"],
  ],
  1970: [
    ["xếp hàng mua gạo", "queueing for rice"], ["loa phường", "the neighborhood loudspeaker"],
    ["tivi đen trắng", "the black-and-white TV"], ["xe đạp Thống Nhất", "the Thong Nhat bicycle"],
    ["những chuyến tàu", "train journeys"], ["áo may Tết", "new clothes for Tet"],
    ["đêm mất điện", "power-cut nights"], ["chợ đồ cũ", "the second-hand market"],
  ],
  1980: [
    ["thời bao cấp", "the subsidy era"], ["tem phiếu", "ration coupons"],
    ["sổ gạo", "the rice ration book"], ["băng cassette", "cassette tapes"],
    ["chiếu phim ngoài trời", "open-air cinema"], ["quạt cây", "the standing fan"],
    ["sắm Tết", "Tet shopping"], ["những năm Đổi Mới đầu tiên", "the first years of Doi Moi"],
  ],
  1990: [
    ["tivi màu", "the color TV"], ["thuê băng video", "renting video tapes"],
    ["trò chơi nhảy dây, bắn bi", "rope-jumping and marbles"], ["xe Honda Cub", "the Honda Cub"],
    ["đài FM", "FM radio"], ["World Cup 1998 xem chung", "watching World Cup 1998 together"],
    ["quán net đầu tiên", "the first internet cafe"], ["thẻ điện thoại", "phone cards"],
  ],
  2000: [
    ["điện thoại Nokia", "the Nokia phone"], ["tin nhắn SMS", "SMS messages"],
    ["Yahoo Messenger", "Yahoo Messenger"], ["quán net", "internet cafes"],
    ["nhạc chuông", "ringtones"], ["đĩa VCD", "VCD discs"],
    ["Tết đầu tiên có điện thoại di động", "the first Tet with a mobile phone"], ["blog và Yahoo 360", "blogs and Yahoo 360"],
  ],
  2010: [
    ["Facebook", "Facebook"], ["Zalo", "Zalo"],
    ["chiếc smartphone đầu tiên", "the first smartphone"], ["chụp ảnh selfie", "taking selfies"],
    ["chúc Tết qua mạng", "online Tet greetings"], ["gọi xe công nghệ", "ride-hailing apps"],
    ["mạng 3G, 4G", "3G and 4G"], ["livestream", "livestreaming"],
  ],
  2020: [
    ["mùa giãn cách", "the lockdown season"], ["học online", "online school"],
    ["họp mặt qua video", "video-call reunions"], ["chiếc khẩu trang", "the face mask"],
    ["thanh toán bằng mã QR", "QR payments"], ["TikTok", "TikTok"],
    ["sum họp sau dịch", "reunions after the pandemic"], ["trợ lý AI", "AI assistants"],
  ],
};

// Một số năm đáng nhớ (bạn có thể sửa hoặc thêm)
export const NOTABLE: Record<number, Bi[]> = {
  1954: [["chiến thắng Điện Biên Phủ", "the Dien Bien Phu victory"]],
  1975: [["ngày đất nước thống nhất 30/4", "Reunification Day, 30 April"]],
  1986: [["Đổi Mới", "the Doi Moi reforms"]],
  1995: [["Việt Nam gia nhập ASEAN", "Vietnam joins ASEAN"]],
  1997: [["Internet đến Việt Nam", "the Internet arrives in Vietnam"]],
  2003: [["SEA Games tại Hà Nội", "the SEA Games in Hanoi"]],
  2007: [["Việt Nam gia nhập WTO", "Vietnam joins the WTO"]],
  2008: [["AFF Cup: Việt Nam vô địch", "Vietnam wins the AFF Cup"]],
  2018: [["U23 Việt Nam ở Thường Châu", "U23 Vietnam in Changzhou"]],
  2020: [["năm COVID-19", "the COVID-19 year"]],
};

// Mốc đời theo tuổi
export const LIFE_STAGES: { age: number; kw: Bi }[] = [
  { age: 0, kw: ["năm chào đời", "the year of birth"] },
  { age: 6, kw: ["ngày đầu tiên đi học", "the first day of school"] },
  { age: 12, kw: ["những năm cấp 2", "the middle-school years"] },
  { age: 15, kw: ["những năm cấp 3", "the high-school years"] },
  { age: 18, kw: ["năm thi đại học, chọn nghề", "the year of exams and choosing a career"] },
  { age: 22, kw: ["công việc đầu tiên", "the first job"] },
  { age: 26, kw: ["ngày cưới, lập gia đình", "the wedding and starting a family"] },
];

export function keywordsForYear(year: number): Bi[] {
  const decade = Math.max(1940, Math.min(2020, Math.floor(year / 10) * 10));
  return [...(NOTABLE[year] ?? []), ...(DECADES[decade] ?? [])];
}