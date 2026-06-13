/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { PRESET_VIBES } from "./src/data/fallbackSongs";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON size limit to support base64 image uploads
app.use(express.json({ limit: "25mb" }));

// Lazy init Google GenAI client to prevent crash if key is missing or is placeholder
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// --- SPOTIFY CLIENT CREDENTIALS FLOW & TRACK SEARCH ---
let spotifyAccessToken = "";
let spotifyTokenExpiry = 0; // Epoch time when token expires

async function getSpotifyAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.trim() === "" || clientSecret.trim() === "" || clientId === "SPOTIFY_CLIENT_ID") {
    console.log("Spotify API credentials not fully configured. Using fallback pre-defined audio tracks.");
    return null;
  }

  // Use cached token if valid
  if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
    return spotifyAccessToken;
  }

  try {
    const authHeader = Buffer.from(`${clientId.trim()}:${clientSecret.trim()}`).toString("base64");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Spotify Token Request failed (${response.status}):`, errorText);
      return null;
    }

    const data: any = await response.json();
    if (data.access_token) {
      spotifyAccessToken = data.access_token;
      // Expire token 5 minutes early (typically 3600s total duration)
      const expiresInMs = (data.expires_in || 3600) * 1000;
      spotifyTokenExpiry = Date.now() + expiresInMs - 300000;
      console.log("Successfully retrieved and cached new Spotify Access Token.");
      return spotifyAccessToken;
    }
    return null;
  } catch (error) {
    console.error("Error getting Spotify access token:", error);
    return null;
  }
}

interface SpotifyTrackInfo {
  previewUrl: string | null;
  albumCoverUrl: string | null;
  spotifyUrl: string | null;
}

async function searchSpotify(songName: string, artist: string): Promise<SpotifyTrackInfo | null> {
  const token = await getSpotifyAccessToken();
  if (!token) return null;

  try {
    // Sanitize Vietnamese keywords that interfere with Spotify search queries
    const cleanSong = songName.replace(/remix|cucak|lofi|speed up|slowed|giựt|nhạc giựt/gi, "").trim();
    const query = encodeURIComponent(`track:${cleanSong} artist:${artist}`);
    const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

    const response = await fetch(searchUrl, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`Spotify Search strict query failed for "${songName}" by "${artist}".`);
      return null;
    }

    const data: any = await response.json();
    let track = data.tracks?.items?.[0];

    // If matching track not found with strict filter, try a broader query
    if (!track) {
      const simpleQuery = encodeURIComponent(`${cleanSong} ${artist}`);
      const fallbackUrl = `https://api.spotify.com/v1/search?q=${simpleQuery}&type=track&limit=1`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (fallbackResponse.ok) {
        const fallbackData: any = await fallbackResponse.json();
        track = fallbackData.tracks?.items?.[0];
      }
    }

    if (track) {
      return {
        previewUrl: track.preview_url || null,
        albumCoverUrl: track.album?.images?.[0]?.url || null,
        spotifyUrl: track.external_urls?.spotify || null
      };
    }
    return null;
  } catch (error) {
    console.error(`Error searching Spotify for "${songName}" - "${artist}":`, error);
    return null;
  }
}

// 1. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. API: Image-to-Song recommendation engine
app.post("/api/recommend-songs", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", preferredStyle = "all" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: "Chưa có ảnh được gửi lên hệ thống.",
      });
    }

    // Clean base64 string
    let cleanBase64 = imageBase64;
    let finalMimeType = mimeType;
    if (imageBase64.includes(";base64,")) {
      const parts = imageBase64.split(";base64,");
      cleanBase64 = parts[1];
      if (parts[0].startsWith("data:")) {
        finalMimeType = parts[0].substring(5);
      }
    }

    // Helper to find best fallback preset if API is down or unavailable
    const getFallbackPresetByStyle = (style: string) => {
      if (!style || style === "all") {
        return PRESET_VIBES[Math.floor(Math.random() * PRESET_VIBES.length)];
      }
      
      // Attempt to find preset matching style keyword
      const matched = PRESET_VIBES.filter(preset => {
        const textToMatch = (preset.atmosphere + " " + preset.recommendations.map(r => r.mood + " " + r.title).join(" ")).toLowerCase();
        
        if (style === "vpop") return textToMatch.includes("v-pop") || textToMatch.includes("trendy") || textToMatch.includes("trẻ");
        if (style === "rap") return textToMatch.includes("rap") || textToMatch.includes("hip") || textToMatch.includes("bụi");
        if (style === "vinahouse") return textToMatch.includes("vinahouse") || textToMatch.includes("giựt") || textToMatch.includes("remix") || textToMatch.includes("cucak");
        if (style === "chill") return textToMatch.includes("chill") || textToMatch.includes("healing") || textToMatch.includes("indie");
        if (style === "lofi") return textToMatch.includes("lofi") || textToMatch.includes("mộc") || textToMatch.includes("hoài niệm");
        return false;
      });
      
      return matched.length > 0 ? matched[Math.floor(Math.random() * matched.length)] : PRESET_VIBES[0];
    };

    const ai = getAIClient();
    // Check if running in DEMO mode / Fallback mode
    if (!ai) {
      console.log("No GEMINI_API_KEY set or is placeholder. Using curated Vietnamese presets fallback.");
      const chosenPreset = getFallbackPresetByStyle(preferredStyle);
      const originalRecs = chosenPreset.recommendations || [];

      // Enrich with Spotify
      const recommendations = await Promise.all(
        originalRecs.map(async (song: any) => {
          try {
            const spotifyInfo = await searchSpotify(song.title, song.artist);
            if (spotifyInfo) {
              return {
                ...song,
                previewUrl: spotifyInfo.previewUrl || null,
                albumCoverUrl: spotifyInfo.albumCoverUrl || null,
                spotifyUrl: spotifyInfo.spotifyUrl || null
              };
            }
          } catch (sErr) {
            console.error(`Failed to lookup Spotify (Demo) for ${song.title} - ${song.artist}:`, sErr);
          }
          return {
            ...song,
            previewUrl: null,
            albumCoverUrl: null,
            spotifyUrl: null
          };
        })
      );
      
      return res.json({
        success: true,
        isDemo: true,
        imageAnalysis: {
          atmosphere: `${chosenPreset.atmosphere} (Demo Mode - Hãy điền GEMINI_API_KEY để cảm nhận bức ảnh thực tế nhé)`,
          dominantColors: chosenPreset.dominantColors,
          detectedObjects: chosenPreset.detectedObjects,
          detectedWeather: "Trực giác thời tiết ấm áp mây mờ 🍃",
          vibeRating: chosenPreset.vibeRating
        },
        recommendations
      });
    }

    // Map style key to human readable instruction
    const styleDescriptions: Record<string, string> = {
      all: "Mọi thể loại phong phú đang thịnh hành (ưu tiên sự phù hợp cao nhất với bức ảnh)",
      vpop: "Ưu tiên V-Pop thịnh hành nhất, trẻ trung, bắt mắt và ngập tràn tình cảm thanh xuân ngọt ngào",
      rap: "Ưu tiên Rap và Hip-Hop Việt bụi bặm, kiểu đường phố hoặc tự sự sâu lắng của giới Underground",
      vinahouse: "Ưu tiên Vinahouse hoặc các bản remix sôi động phập phồng nhảy nhót giật giật mạnh mẽ (Remix / Cucak / Speed Up / Nhạc giựt giựt)",
      chill: "Ưu tiên Chill-out, Healing xoa dịu tâm hồn, Indie ngọt ngào mộc mạc lãng mạn lãng đãng",
      lofi: "Ưu tiên âm sắc Lofi lãng đãng, êm ấm, mộc mạc chứa đầy hoài niệm xưa cũ",
      tet: "Ưu tiên nhạc Tết cổ truyền hân hoan rộn rã, nhạc xuân tưng bừng hớn hở, mang hương vị sum vầy ấm cúng rước tài lộc cho năm mới",
      birthday: "Ưu tiên nhạc sinh nhật vui tươi, tưng bừng giật giật rộn rã hoặc mừng tuổi mới tươi sáng đầy hy vọng, tích cực",
      family: "Ưu tiên nhạc gia đình sum họp đầm ấm, ca khúc tình mẫu tử, tình phụ tử hay tình thân chứa chan sưởi ấm tâm hồn",
      friends: "Ưu tiên nhạc tình bạn dạt dào thanh xuân du hí, đi phượt đi chơi vui vẻ hay những kỷ niệm thời học sinh gắn kết tri kỷ",
      pets: "Ưu tiên nhạc dễ thương, vui tươi tinh nghịch cưng xỉu dành riêng cho thú cưng chó mèo đáng yêu làm trò",
      mother_baby: "Ưu tiên nhạc mẹ và bé ngọt ngào, lời ru êm đềm, chứa chan tình thương trong sáng, dịu nhẹ xoa dịu búp măng non",
      meme: "Ưu tiên nhạc chế hài hước lầy lội, nhạc remix hài bá đạo, nhạc tik tok điên rồ mang độ giải trí cực cao, vui nhộn hài hước"
    };

    const styleInstruction = styleDescriptions[preferredStyle] || styleDescriptions.all;

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: finalMimeType,
      },
    };

    const textPart = {
      text: `Hãy phân tích bức ảnh này và đề xuất từ 5-10 bài hát Việt Nam (hoặc nhạc quốc tế cực kỳ phổ biến đang làm mưa làm gió trong cộng đồng Gen Z Việt Nam) phù hợp nhất để làm nhạc Story trên mạng xã hội Facebook, Instagram, TikTok.
      
      ⚠️ YÊU CẦU ĐẶC BIỆT VỀ PHONG CÁCH NHẠC MONG WAN TỪ NGƯỜI DÙNG:
      Hệ thống đề xuất CẦN TUÂN THỦ: "${styleInstruction}".
      Hãy điều phối và chọn các bài hát thuộc phong cách định hướng này nhưng song song đó phải luôn có sự gắn kết hợp lý tối đa với cảm xúc bối cảnh trong bức ảnh của người dùng tải lên.

      ⚠️ ĐẶC BIỆT: Hãy nhận diện chính xác tình trạng THỜI TIẾT và thời gian trong bức ảnh (như ngày nắng rạng rỡ, trời mưa tầm tã rơi lệ, hoàng hôn chiều tà mộng mơ, gió lạnh, mây mù âm u, hay cảnh bóng đêm, cảnh trong nhà ấm cúng không thấy rõ thời tiết...). 
      Từ đó tích hợp cảm xúc thời tiết vào bài hát (ví dụ trời mưa thì đề xuất những bài nhạc tâm trạng rưng rưng ướt át lofi, trời nắng thì đề xuất bài nhạc sôi động, vui tươi yêu đời, hoàng hôn thì đề xuất giai điệu hoài niệm mênh mang...).

      Hệ thống đề xuất cần nhận biết cả các thể loại chính thống và các phạm trù văn hóa phi chính thống thường được sử dụng ở Việt Nam, ví dụ như:
      - Bản phối lại (Remix)
      - Vinahouse ("nhạc giựt giựt" tưng bừng)
      - Chill, Healing, xoa dịu tâm hồn
      - Nhạc buồn sâu lắng, nhạc tình yêu, nhạc thất tình chia tay
      - V-Pop trẻ trung cực trendy
      - Indie, Lofi Việt mộc mạc phong trần
      - Đèn đường xe chạy đêm muộn (Late Night Drive / City Pop)
      - Xu hướng TikTok capcut mờ lem dạo gần đây (với các hiệu ứng Speed Up hoặc Slowed + Reverb thịnh hành)
      - Nhạc quán cà phê mộc mạc lắng đọng

      Tránh các đề xuất quá cũ kỹ, hãy ưu tiên các bài hát có tính lan truyền và cộng hưởng mạnh mẽ với tâm trạng bức ảnh.
      Hãy tự quyết định góc độ nghệ thuật nào của bức ảnh là quan trọng nhất (ánh sáng, nhân vật, dáng vẻ, tone màu chủ đạo, các biểu tượng ẩn dụ nhỏ) để kết ghép giai điệu phù hợp nhất, khiến người dùng phải thốt lên kinh ngạc vì sự đồng điệu tâm hồn.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: `Bạn là một AI Giám đốc Sáng tạo và Chuyên gia Âm nhạc Việt Nam sành điệu, hài hước, mang đậm phong cách Gen Z.
        Nhiệm vụ của bạn là phân tích bất kỳ hình ảnh nào người dùng tải lên, cảm nhận "vibe" siêu việt của nó, và đề xuất từ 5 đến 10 bản nhạc đỉnh nhất cùng những lý giải mộc mạc, thơ mộng, đốn tim bằng tiếng Việt.
        Hãy tạo cho người dùng những câu trích dẫn lyrics thích hợp để copy dán liền tay làm Story và các tone màu nghệ thuật.
        Luôn trả về kết quả dưới dạng JSON hoàn hảo tuân thủ schema thiết lập sẵn.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atmosphere: {
              type: Type.STRING,
              description: "Tóm tắt không khí cảm xúc bao trùm của bức ảnh này bằng tiếng Việt (1 câu ngắn gọn)."
            },
            dominantColors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Mã 3 màu HEX đại diện cho bối cảnh của bức ảnh, dùng để thiết kế màu nền giao diện."
            },
            detectedObjects: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Liệt kê 2-3 đối tượng chụp, bối cảnh hay yếu tố đắt giá nhất phát hiện trong ảnh."
            },
            detectedWeather: {
              type: Type.STRING,
              description: "Nhận diện tình trạng thời tiết và bối cảnh ánh sáng trong ảnh bằng một cụm từ tiếng Việt kèm icon (ví dụ: 'Ngày nắng ấm rạng rỡ ☀️', 'Trời mưa bay dào dạt 🌧️', 'Hoàng hôn buông lãng mạn 🌅', 'Ban đêm lên đèn lung linh 🌙', 'Trời mây âm u suy tư ☁️', 'Trong phòng ấm cúng 🏡')."
            },
            vibeRating: {
              type: Type.STRING,
              description: "Đánh giá mức độ nghệ thuật/chill của ảnh bằng tiếng Việt kèm icon (ví dụ: '9.9/10 - Over hợp với chill phố xá')."
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Tên bài hát rõ ràng (tiếng Việt hoặc quốc tế phổ quát ở Việt Nam), ví dụ: 'Chìm Sâu', 'Waiting For You', 'Bao Tiền Một Mớ Bình Yên'."
                  },
                  artist: {
                    type: Type.STRING,
                    description: "Nghệ sĩ hát gốc hay nghệ sĩ phối khí chính."
                  },
                  mood: {
                    type: Type.STRING,
                    description: "Tâm trạng hay thể loại mác đặc thù (ví dụ: 'Late Night Chill', 'Vinahouse Giựt Giựt', 'Healing ấm áp', 'Hiphop bụi bặm')."
                  },
                  reason: {
                    type: Type.STRING,
                    description: "Lý do vì sao bài nhạc này lại cực kỳ đồng điệu với bức ảnh, viết sâu sắc, thơ mộng, dễ thương hoặc hóm hỉnh chất lừ."
                  },
                  lyricSnippet: {
                    type: Type.STRING,
                    description: "Một câu hát/lyrics đắt giá nhất trong bài (chỉ 1 dòng ngắn) phù hợp để hiện nổi bật trong Story."
                  },
                  caption: {
                    type: Type.STRING,
                    description: "Một dòng caption gợi ý đăng kèm khi đăng Story có bài hát này, chứa icon bắt mắt và trẻ trung."
                  },
                  accentColor: {
                    type: Type.STRING,
                    description: "Một mã màu HEX đại diện cho nguồn năng lượng bài hát này (nên dùng gam màu rực rỡ để nổi bật trong giao diện tối tăm)."
                  },
                  layoutStyle: {
                    type: Type.STRING,
                    description: "Gợi ý style trình chiếu visual: chỉ được chọn một trong 4 giá trị: 'vinyl_disk', 'classic_lyrics', 'neon_wave', 'minimalist_album'."
                  },
                  fontStyle: {
                    type: Type.STRING,
                    description: "Gợi ý font biểu diễn đắt giá: chỉ được chọn một trong 4 giá trị: 'serif', 'mono', 'sans', 'display'."
                  }
                },
                required: ["title", "artist", "mood", "reason", "lyricSnippet", "caption", "accentColor", "layoutStyle", "fontStyle"]
              }
            }
          },
          required: ["atmosphere", "dominantColors", "detectedObjects", "detectedWeather", "vibeRating", "recommendations"]
        }
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    const originalRecs = parsedJson.recommendations || [];

    // Search Spotify in parallel to enrich the recommendations with real preview URLs
    const recommendations = await Promise.all(
      originalRecs.map(async (song: any) => {
        try {
          const spotifyInfo = await searchSpotify(song.title, song.artist);
          if (spotifyInfo) {
            return {
              ...song,
              previewUrl: spotifyInfo.previewUrl || null,
              albumCoverUrl: spotifyInfo.albumCoverUrl || null,
              spotifyUrl: spotifyInfo.spotifyUrl || null
            };
          }
        } catch (sErr) {
          console.error(`Failed to lookup Spotify for ${song.title} - ${song.artist}:`, sErr);
        }
        return {
          ...song,
          previewUrl: null,
          albumCoverUrl: null,
          spotifyUrl: null
        };
      })
    );

    return res.json({
      success: true,
      isDemo: false,
      imageAnalysis: {
        atmosphere: parsedJson.atmosphere || "Vibe nhẹ mơn man cuốn hút lơ đễnh.",
        dominantColors: parsedJson.dominantColors || ["#FF9E79", "#533D36", "#FAC8AF"],
        detectedObjects: parsedJson.detectedObjects || ["Phông nền tự nhiên"],
        detectedWeather: parsedJson.detectedWeather || "Trời trong xanh tưng bừng ✨",
        vibeRating: parsedJson.vibeRating || "9.5/10 - Xứng đáng triệu tym"
      },
      recommendations
    });

  } catch (err: any) {
    console.error("Gemini suggestion failed, falling back to curated presets:", err);
    
    // Choose a random preset when Gemini API fails or is experiencing high demand
    const randomIndex = Math.floor(Math.random() * PRESET_VIBES.length);
    const chosenPreset = PRESET_VIBES[randomIndex];
    const originalRecs = chosenPreset.recommendations || [];

    const recommendations = await Promise.all(
      originalRecs.map(async (song: any) => {
        try {
          const spotifyInfo = await searchSpotify(song.title, song.artist);
          if (spotifyInfo) {
            return {
              ...song,
              previewUrl: spotifyInfo.previewUrl || null,
              albumCoverUrl: spotifyInfo.albumCoverUrl || null,
              spotifyUrl: spotifyInfo.spotifyUrl || null
            };
          }
        } catch (sErr) {
          console.error(`Failed to lookup Spotify (Fallback) for ${song.title} - ${song.artist}:`, sErr);
        }
        return {
          ...song,
          previewUrl: null,
          albumCoverUrl: null,
          spotifyUrl: null
        };
      })
    );
    
    return res.json({
      success: true,
      isDemo: true,
      imageAnalysis: {
        atmosphere: `${chosenPreset.atmosphere} (Tự động đề xuất kho nhạc hot-trend do máy chủ AI đang bận)`,
        dominantColors: chosenPreset.dominantColors,
        detectedObjects: chosenPreset.detectedObjects,
        detectedWeather: "Thời tiết ấm áp trong trẻo ☁️",
        vibeRating: chosenPreset.vibeRating
      },
      recommendations
    });
  }
});

// Setup Vite assets / Routing
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite server in development mode");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production build from dist/");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Đề xuất Nhạc Story App] running on http://localhost:${PORT}`);
  });
}

bootstrap();
