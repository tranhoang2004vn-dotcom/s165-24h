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
      
      return res.json({
        success: true,
        isDemo: true,
        imageAnalysis: {
          atmosphere: `${chosenPreset.atmosphere} (Demo Mode - Hãy điền GEMINI_API_KEY để cảm nhận bức ảnh thực tế nhé)`,
          dominantColors: chosenPreset.dominantColors,
          detectedObjects: chosenPreset.detectedObjects,
          vibeRating: chosenPreset.vibeRating
        },
        recommendations: chosenPreset.recommendations
      });
    }

    // Map style key to human readable instruction
    const styleDescriptions: Record<string, string> = {
      all: "Mọi thể loại phong phú đang thịnh hành (ưu tiên sự phù hợp cao nhất với bức ảnh)",
      vpop: "Ưu tiên V-Pop thịnh hành nhất, trẻ trung, bắt mắt và ngập tràn tình cảm thanh xuân ngọt ngào",
      rap: "Ưu tiên Rap và Hip-Hop Việt bụi bặm, đậm chất đường phố hoặc tự sự sâu lắng của giới Underground",
      vinahouse: "Ưu tiên Vinahouse hoặc các bản remix (Remix / Cucak / Speed Up / Nhạc giựt giựt tưng bừng phừng phừng cực kỳ bốc)",
      chill: "Ưu tiên Chill-out, Healing xoa dịu tâm hồn, Indie ngọt ngào mộc mạc lắng đọng",
      lofi: "Ưu tiên âm sắc Lofi lãng đãng, êm ấm, mộc mạc chứa đầy hoài niệm xưa cũ"
    };

    const styleInstruction = styleDescriptions[preferredStyle] || styleDescriptions["all"];

    // Prepare inputs
    const imagePart = {
      inlineData: {
        mimeType: finalMimeType,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Hãy phân tích bức ảnh này và đề xuất từ 5-10 bài hát Việt Nam (hoặc nhạc quốc tế cực kỳ phổ biến đang làm mưa làm gió trong cộng đồng Gen Z Việt Nam) phù hợp nhất để làm nhạc Story trên mạng xã hội Facebook, Instagram, TikTok.
      
      ⚠️ YÊU CẦU ĐẶC BIỆT VỀ PHONG CÁCH NHẠC MONG MUỐN TỪ NGƯỜI DÙNG:
      Hệ thống đề xuất CẦN TUÂN THỦ: "${styleInstruction}".
      Hãy điều phối và chọn các bài hát thuộc phong cách định hướng này nhưng song song đó phải luôn có sự gắn kết hợp lý tối đa với cảm xúc bối cảnh trong bức ảnh của người dùng tải lên.

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
      Hãy tự quyết định góc độ nghệ thuật nào của bức ảnh là quan trọng nhất (ánh sáng, nhân vật, dáng vẻ, tone màu chủ đạo, các biểu tượng ẩn dụ nhỏ) để kết ghép giai điệu phù hợp nhất, khiến người dùng phải thốt lên kinh ngạc vì sự đồng điệu tâm hồn.`,
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
          required: ["atmosphere", "dominantColors", "detectedObjects", "vibeRating", "recommendations"]
        }
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      isDemo: false,
      imageAnalysis: {
        atmosphere: parsedJson.atmosphere || "Vibe nhẹ mơn man cuốn hút lơ đễnh.",
        dominantColors: parsedJson.dominantColors || ["#FF9E79", "#533D36", "#FAC8AF"],
        detectedObjects: parsedJson.detectedObjects || ["Phông nền tự nhiên"],
        vibeRating: parsedJson.vibeRating || "9.5/10 - Xứng đáng triệu tym"
      },
      recommendations: parsedJson.recommendations || []
    });

  } catch (err: any) {
    console.error("Gemini suggestion failed, falling back to curated presets:", err);
    
    // Choose a random preset when Gemini API fails or is experiencing high demand
    const randomIndex = Math.floor(Math.random() * PRESET_VIBES.length);
    const chosenPreset = PRESET_VIBES[randomIndex];
    
    return res.json({
      success: true,
      isDemo: true,
      imageAnalysis: {
        atmosphere: `${chosenPreset.atmosphere} (Tự động đề xuất kho nhạc hot-trend do máy chủ AI đang bận)`,
        dominantColors: chosenPreset.dominantColors,
        detectedObjects: chosenPreset.detectedObjects,
        vibeRating: chosenPreset.vibeRating
      },
      recommendations: chosenPreset.recommendations
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
