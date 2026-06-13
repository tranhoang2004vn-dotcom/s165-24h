/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SongRecommendation } from "../types";

export interface PresetPackage {
  id: string;
  name: string;
  description: string;
  atmosphere: string;
  dominantColors: string[];
  detectedObjects: string[];
  vibeRating: string;
  recommendations: SongRecommendation[];
}

export const PRESET_VIBES: PresetPackage[] = [
  {
    id: "chill_cafe_sunset",
    name: "Chiều Hoàng Hôn Ấm Áp / Cà Phê ☕️",
    description: "Tone màu vàng ấm, nâu trầm, không gian yên bình",
    atmosphere: "Yên ả mộc mạc, có một chút suy tư nhẹ nhàng dưới ánh chiều tà.",
    dominantColors: ["#FFAC7D", "#5A3825", "#F6E8DA"],
    detectedObjects: ["Tách cà phê", "Cửa sổ", "Nắng hoàng hôn", "Sách"],
    vibeRating: "9.5/10 - Chill cực độ",
    recommendations: [
      {
        title: "Để Tôi Ôm Em Bằng Giai Điệu Này",
        artist: "Kai Đinh x MIN x GREY D",
        mood: "Healing & Chill",
        reason: "Bài hát nhẹ nhàng như cái ôm dịu êm, cực kỳ đồng bộ với ánh nắng hoàng hôn ấm áp và cốc cà phê khói bay nhè nhẹ trong ảnh.",
        lyricSnippet: "Có những ngày mệt rã rời, muốn nghe ai đó ôm bằng tiếng hát...",
        caption: "Mong giai điệu này vỗ về những mỏi mệt trong lòng cậu ☁️💫",
        accentColor: "#E67E22",
        layoutStyle: "classic_lyrics",
        fontStyle: "serif"
      },
      {
        title: "Chìm Sâu",
        artist: "RPT MCK feat. Trung Trần",
        mood: "Love Song Ngọt Ngào",
        reason: "Vibe lãng mạn mộng mơ, rất thích hợp cho những khoảnh khắc 'va vào ánh mắt' ngắm hoàng hôn nhẹ nhàng ấm áp.",
        lyricSnippet: "Tại vì nụ cười ấy khiến em như chìm sâu, không biết nói câu gì ngoài yêu đâu...",
        caption: "Có những ánh mắt khiến mình ngỡ như cả bầu trời đang đổ nắng 🌅💛",
        accentColor: "#F39C12",
        layoutStyle: "vinyl_disk",
        fontStyle: "sans"
      },
      {
        title: "bao tiền một mớ bình yên",
        artist: "14 Casper x Bon",
        mood: "Phố Chiều Buồn Lặng",
        reason: "Những nốt nhạc sâu lắng, phù hợp với góc quán quen, khói thuốc nhạt hay góc phố cổ kính vắng bóng người.",
        lyricSnippet: "Bán cho con một mớ bình yên, để không còn khóc mỗi đêm...",
        caption: "Rốt cuộc thì cuộc đời này mua bao nhiêu tiền một mớ bình yên? 🎧🍃",
        accentColor: "#8E44AD",
        layoutStyle: "minimalist_album",
        fontStyle: "mono"
      },
      {
        title: "Thêm Bao Nhiêu Lần",
        artist: "Đạt G",
        mood: "Melancholy Lofi",
        reason: "Thích hợp cho không gian lặng gió, ly nước đá tan và chút nhớ nhung xao xuyến.",
        lyricSnippet: "Anh muốn ôm lấy vai em, dẫu cho ngày mai có nắng hay là mưa rơi...",
        caption: "Vài dòng tâm tư gửi vào gió chiều nay... 🌬️☕️",
        accentColor: "#2980B9",
        layoutStyle: "neon_wave",
        fontStyle: "display"
      }
    ]
  },
  {
    id: "night_ride",
    name: "Phố Đêm Lên Đèn / Lái Xe Đêm Khuya 🌌",
    description: "Đèn đường nhòe mờ, chuyển động, không khí thành phố về đêm",
    atmosphere: "Sâu lắng, chứa đựng sự cô đơn nghệ thuật giữa nhịp sống đô thị về đêm.",
    dominantColors: ["#02021A", "#FF007F", "#00F0FF"],
    detectedObjects: ["Vô lăng", "Đèn đường", "Thành phố mờ sương", "Kính xe đọng nước"],
    vibeRating: "9.8/10 - Đường phố cô đơn",
    recommendations: [
      {
        title: "Nước Hoa",
        artist: "Hoàng Dũng x G-Ducky",
        mood: "Late Night Drive",
        reason: "Sự quyến rũ bất tận kết hợp giữa City Pop và Rap mượt mà, hòa quyện với những ánh đèn đường nhòe mờ phản chiếu trên kính xe.",
        lyricSnippet: "Hương nước hoa nhẹ vương góc tối, đánh thức những rung động sâu kín...",
        caption: "Thành phố này đẹp nhất là khi chỉ có ta và những giai điệu này 🌃🖤",
        accentColor: "#FF007F",
        layoutStyle: "vinyl_disk",
        fontStyle: "display"
      },
      {
        title: "Tình Yêu Có Nghĩa Là Gì",
        artist: "tlinh",
        mood: "Synthpop Mê Đắm",
        reason: "Nhịp synth bay bổng tạo không gian hư ảo cuốn hút, cực kỳ ăn khớp với bối cảnh phố đêm ruy-băng rực rỡ sắc màu.",
        lyricSnippet: "Thế giới này rộng lớn thế, mà lòng anh lại thu bé bằng em thôi...",
        caption: "Giữa phố đêm lấp lánh, tâm trí này vẫn ngập tràn hình bóng cậu 📡✨",
        accentColor: "#9B59B6",
        layoutStyle: "neon_wave",
        fontStyle: "sans"
      },
      {
        title: "Đầu Đường Xó Chợ",
        artist: "Thắng (Ngọt)",
        mood: "Indie Thơ Mộng",
        reason: "Lời nhạc mộc mạc phóng khoáng, thích hợp cho chuyến đi đêm rông dài quanh hồ hay bờ kè lộng gió.",
        lyricSnippet: "Đi lang thang qua ngõ tối, nghe tiếng mưa rơi đều...",
        caption: "Bụi bặm một chút, nhưng tự do tự tại giữa lòng thành phố 🌙🚲",
        accentColor: "#27AE60",
        layoutStyle: "classic_lyrics",
        fontStyle: "serif"
      },
      {
        title: "Waiting For You",
        artist: "MONO",
        mood: "Retro Dance 80s",
        reason: "Vibe nhạc giật sôi động nhưng mang mác buồn lãng mạn, hoàn hảo cho những story 'buồn lướt' đầy cá tính.",
        lyricSnippet: "Waiting for you tùng đêm... Tìm bóng dáng ấy trong cơn mộng say...",
        caption: "Bóng đêm lướt nhanh qua cửa sổ, tim này vẫn đợi chờ một người 📻💔",
        accentColor: "#1ABC9C",
        layoutStyle: "minimalist_album",
        fontStyle: "mono"
      }
    ]
  },
  {
    id: "party_vinahouse",
    name: "Tiệc Tùng Sôi Động / Nhạc Giựt Giựt 🚀",
    description: "Đèn laser, cốc bia, đám đông, bầu không khí vui vẻ đầy năng lượng",
    atmosphere: "Cháy hết mình, hừng hực năng lượng tiệc tùng và nhạc quẩy.",
    dominantColors: ["#DFFF00", "#FF0000", "#111111"],
    detectedObjects: ["Đèn sân khấu", "Ly bia", "Loa", "Nụ cười rực rỡ"],
    vibeRating: "10/10 - Max Energy",
    recommendations: [
      {
        title: "Phong Long",
        artist: "Low G x Obito",
        mood: "V-HipHop Cực Chất",
        reason: "Lyrics chất chơi mộc mạc và flow cực nảy, thích hợp cho những khung hình khoe outfit street-style sành điệu hoặc tụ hợp anh em quẩy.",
        lyricSnippet: "Nhìn cái cách anh bước vào party, ai cũng biết là ai rồi đấy...",
        caption: "Cháy hết nấc cùng homies đêm nay thôi nào! 🔥😎",
        accentColor: "#E74C3C",
        layoutStyle: "minimalist_album",
        fontStyle: "mono"
      },
      {
        title: "À Lôi (Remix Vinahouse)",
        artist: "Double2T x DJ House-Music",
        mood: "Nhạc Giựt Giựt Vinahouse",
        reason: "Giai điệu đậm chất dân tộc phối Vinahouse giật tưng bừng cực kỳ bắt tai, làm bùng nổ mọi Story năng lượng lôi cuốn nhất.",
        lyricSnippet: "À lôi, noọng ơi! Gặp em giữa dòng người là anh muốn ngỏ lời...",
        caption: "Một chút nhạc 'giựt giựt' cho năng lượng tràn trề ⚡🔊",
        accentColor: "#02C39A",
        layoutStyle: "neon_wave",
        fontStyle: "display"
      },
      {
        title: "See Tình (Speed Up Version)",
        artist: "Hoàng Thùy Linh",
        mood: "TikTok Trend Viral",
        reason: "Bản phối nhanh tươi vui nhí nhảnh cực kỳ thịnh hành trên TikTok, hợp với các story nhún nhảy vui vẻ.",
        lyricSnippet: "Uầy uầy uây uây... Thấy em là yêu đời liền hà...",
        caption: "Dù thế nào thì cũng phải si tình thoyyyy 💖💃",
        accentColor: "#F48FB1",
        layoutStyle: "vinyl_disk",
        fontStyle: "sans"
      }
    ]
  }
];
