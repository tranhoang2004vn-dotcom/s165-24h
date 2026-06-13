/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  Music, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  Heart, 
  HeartHandshake,
  PartyPopper,
  Instagram,
  Eye,
  Settings,
  HelpCircle,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import Header from "./components/Header";
import AboutModal from "./components/AboutModal";
import StoryPreview from "./components/StoryPreview";
import DemoVibeTester from "./components/DemoVibeTester";
import SongRecommendationsList from "./components/SongRecommendationsList";

import { SongRecommendation, AnalysisResponse } from "./types";
import { PresetPackage } from "./data/fallbackSongs";

const LOADING_PHRASES = [
  "🧠 Đang bóc tách bối cảnh, cảm nhận chiều sâu bức ảnh...",
  "🎨 Đang phối màu nghệ thuật, bóc màu sắc chủ đạo...",
  "🎵 Đang rà soát kho nhạc V-Pop, Rap, Indie thịnh hành nhất...",
  "⚡ Đang chuẩn bị giai điệu Vinahouse giựt giựt hừng hực...",
  "💖 Tìm kiếm tần số rung động tâm hồn hoàn hảo với nụ cười bạn...",
  "📻 Tạo câu caption Story đốn tim đăng là dính..."
];

export const MUSIC_STYLES = [
  { id: "all", label: "Tự động theo ảnh ✨", icon: "✨", desc: "AI thấu cảm tự gợi ý nhạc chuẩn đét" },
  { id: "vpop", label: "V-Pop Trendy 🔥", icon: "🔥", desc: "Top nhạc trẻ cực ngọt, dễ thương, đầy cảm xúc" },
  { id: "rap", label: "Rap / Hip-Hop 🎤", icon: "🎤", desc: "Nhịp điệu tự sự bụi bặm, chất lừ của Underground" },
  { id: "vinahouse", label: "Vinahouse / Remix ⚡", icon: "⚡", desc: "Bản phối giựt giựt giật dập sôi động tưng bừng" },
  { id: "chill", label: "Indie / Cafe Chill ☕", icon: "☕", desc: "Mộc mạc xoa dịu tâm hồn ngọt ngào lãng mạn" },
  { id: "lofi", label: "Lofi Hoài Niệm ☁️", icon: "☁️", desc: "Thư thái mộc mạc, hoài niệm êm ấm xưa cũ" },
  { id: "tet", label: "Tết Sum Vầy 🧧", icon: "🧧", desc: "Giai điệu xuân hân hoan hớn hở, rước tài đón lộc" },
  { id: "birthday", label: "Sinh Nhật Vui 🎂", icon: "🎂", desc: "Chúc mừng tuổi mới rực rỡ vui tươi tơi rói" },
  { id: "family", label: "Ấm Áp Gia Đình 🏡", icon: "🏡", desc: "Tình mẫu tử, phụ tử thiêng liêng sưởi ấm tâm hồn" },
  { id: "friends", label: "Quậy Với Bạn Bè 👥", icon: "👥", desc: "Thanh xuân du hí quẩy hết nấc cùng tri kỷ" },
  { id: "pets", label: "Cưng Xỉu Thú Cưng 🐾", icon: "🐾", desc: "Nhạc vui tươi dí dỏm vui nhộn cho boss chó mèo" },
  { id: "mother_baby", label: "Mẹ Và Bé 🍼", icon: "🍼", desc: "Lời ru êm áu dịu ngọt và âm sắc tuổi thơ trong sáng" },
  { id: "meme", label: "Nhạc Chế Lầy Lội 🤪", icon: "🤪", desc: "Độ giải trí siêu cấp bá đạo, hài hước lầy lội cực cao" }
];

// Helper to scale photos for quota-safe storage in localStorage
function createThumbnail(base64Data: string, maxWidth = 320): Promise<string> {
  return new Promise((resolve) => {
    if (!base64Data || !base64Data.startsWith("data:image")) {
      resolve(base64Data);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = base64Data;
    img.onload = () => {
      const scale = maxWidth / img.width;
      if (scale >= 1) {
        resolve(base64Data);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      } else {
        resolve(base64Data);
      }
    };
    img.onerror = () => resolve(base64Data);
  });
}

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [preferredStyle, setPreferredStyle] = useState<string>("all");
  
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  // Loading texts rotation index
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState<number>(0);
  
  // Image metadata states
  const [imageAnalysis, setImageAnalysis] = useState<{
    atmosphere: string;
    dominantColors: string[];
    detectedObjects: string[];
    vibeRating: string;
  } | null>(null);
  
  // Recommendations list
  const [recommendations, setRecommendations] = useState<SongRecommendation[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongRecommendation | null>(null);
  
  // UI Triggers
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotate loading phrases beautifully when analytical loading is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("story_vibe_history_v2");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Lỗi đọc lịch sử:", e);
    }
  }, []);

  // Automatic smooth scroll down to results workspace when AI analysis finishes loading
  useEffect(() => {
    if (imageSrc && !isAnalyzing) {
      const timer = setTimeout(() => {
        const resultsEl = document.getElementById("results-workspace");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300); // 300ms window delay to ensure React DOM layout finishes rendering
      return () => clearTimeout(timer);
    }
  }, [imageSrc, isAnalyzing]);

  // Save selection with compressed thumbnail representation in storage
  const addToHistory = async (
    img: string,
    analysis: any,
    recs: SongRecommendation[],
    selSong: SongRecommendation | null,
    style: string
  ) => {
    try {
      const thumb = await createThumbnail(img, 360);
      const newItem = {
        id: Date.now().toString(),
        imageSrc: thumb,
        imageAnalysis: analysis,
        recommendations: recs,
        selectedSong: selSong,
        preferredStyle: style,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
      };

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.imageSrc !== thumb);
        const updated = [newItem, ...filtered].slice(0, 5);
        localStorage.setItem("story_vibe_history_v2", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error("Lỗi lưu lịch sử:", err);
    }
  };

  const handleSelectHistoryItem = (item: any) => {
    setImageSrc(item.imageSrc);
    setImageAnalysis(item.imageAnalysis);
    setRecommendations(item.recommendations);
    setSelectedSong(item.selectedSong);
    setPreferredStyle(item.preferredStyle || "all");
    setErrorText(null);
  };

  // Retrigger Analysis with explicit style
  const retriggerAnalysisWithStyle = async (newStyle: string) => {
    if (!imageSrc) return;
    setPreferredStyle(newStyle);
    setIsAnalyzing(true);
    setErrorText(null);
    try {
      const response = await fetch("/api/recommend-songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageBase64: imageSrc,
          mimeType: "image/jpeg",
          preferredStyle: newStyle
        })
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối đến Máy chủ AI. Hãy thử lại sau nhé!");
      }

      const data: AnalysisResponse = await response.json();
      
      if (data.success) {
        setImageAnalysis(data.imageAnalysis || null);
        setRecommendations(data.recommendations || []);
        setIsDemoMode(data.isDemo);
        if (data.recommendations && data.recommendations.length > 0) {
          setSelectedSong(data.recommendations[0]);
        }
      } else {
        throw new Error(data.message || "Xử lý ảnh lỗi.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Có sự cố khi phân tích ảnh bằng trí tuệ nhân tạo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Photo File parsing to Base64
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorText("Định dạng tệp không hợp lệ! Vui lòng chọn một bức ảnh chụp.");
      return;
    }
    
    // Max 15MB representation limits
    if (file.size > 15 * 1024 * 1024) {
      setErrorText("Ảnh của bạn quá lớn! Vui lòng tải ảnh có kích thước dưới 15MB.");
      return;
    }

    setErrorText(null);
    setUploadProgress(0);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      setImageSrc(base64Data);
      
      // Animate progress smoothly inside dropzone before kicking off AI analysis API
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 14) + 12;
        if (currentProgress >= 100) {
          currentProgress = 100;
          setUploadProgress(100);
          clearInterval(progressInterval);
          
          setTimeout(async () => {
            setUploadProgress(null);
            setIsAnalyzing(true);
            
            // Perform AI Analysis request to server
            try {
              const response = await fetch("/api/recommend-songs", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  imageBase64: base64Data,
                  mimeType: file.type,
                  preferredStyle: preferredStyle
                })
              });

              if (!response.ok) {
                throw new Error("Không thể kết nối đến Máy chủ AI. Hãy thử lại sau nhé!");
              }

              const data: AnalysisResponse = await response.json();
              
              if (data.success) {
                setImageAnalysis(data.imageAnalysis || null);
                setRecommendations(data.recommendations || []);
                setIsDemoMode(data.isDemo);
                const firstSong = data.recommendations && data.recommendations.length > 0 ? data.recommendations[0] : null;
                setSelectedSong(firstSong);
                
                // Save this selection to history
                addToHistory(base64Data, data.imageAnalysis || null, data.recommendations || [], firstSong, preferredStyle);

              } else {
                throw new Error(data.message || "Xử lý ảnh lỗi.");
              }
            } catch (err: any) {
              console.error(err);
              setErrorText(err.message || "Có sự cố khi phân tích ảnh bằng trí tuệ nhân tạo.");
            } finally {
              setIsAnalyzing(false);
            }
          }, 400); // small visual pause for completion feedback
        } else {
          setUploadProgress(currentProgress);
        }
      }, 70);
    };

    reader.onerror = () => {
      setErrorText("Không đọc được tệp tin ảnh.");
      setUploadProgress(null);
    };

    reader.readAsDataURL(file);
  };

  // Drag and Drop listeners
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Preset click triggers instant mockup
  const handleSelectPreset = (preset: PresetPackage, dataUrl: string) => {
    setErrorText(null);
    setIsAnalyzing(true);
    
    // Simulate short AI analysis wait of 1.2s to maintain the "magic" feel!
    setTimeout(() => {
      setImageSrc(dataUrl);
      const analysisData = {
        atmosphere: preset.atmosphere,
        dominantColors: preset.dominantColors,
        detectedObjects: preset.detectedObjects,
        detectedWeather: "Trực giác thời tiết ấm mây dịu 🍃",
        vibeRating: preset.vibeRating
      };
      setImageAnalysis(analysisData);
      setRecommendations(preset.recommendations);
      setIsDemoMode(true); // It uses presets directly inside falls
      setSelectedSong(preset.recommendations[0]);
      setIsAnalyzing(false);

      // Save preset testing to user history
      addToHistory(dataUrl, analysisData, preset.recommendations, preset.recommendations[0], preferredStyle);
    }, 1200);
  };

  // Reset all flow
  const handleReset = () => {
    setImageSrc(null);
    setImageAnalysis(null);
    setRecommendations([]);
    setSelectedSong(null);
    setErrorText(null);
  };

  // Update selected recommendation parameter (layout, color or fonts) from preview editor
  const handleUpdateSelectedSong = (updates: Partial<SongRecommendation>) => {
    if (!selectedSong) return;
    const updated = { ...selectedSong, ...updates };
    setSelectedSong(updated);
    
    // Synchronize updates into the list too to avoid mismatch
    setRecommendations((prev) => 
      prev.map((r) => r.title === updated.title ? updated : r)
    );

    // Synchronize design customizer changes back to storage history as well!
    setHistory((prev) => {
      const updatedHistory = prev.map((item) => {
        if (item.imageSrc === imageSrc) {
          const updatedRecs = item.recommendations.map((r: any) => 
            r.title === updated.title ? updated : r
          );
          return {
            ...item,
            recommendations: updatedRecs,
            selectedSong: item.selectedSong?.title === updated.title ? updated : item.selectedSong
          };
        }
        return item;
      });
      localStorage.setItem("story_vibe_history_v2", JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0510] text-stone-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white relative overflow-x-hidden" id="app-root-wrapper">
      {/* Immersive Atmospheric background elements */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Dynamic Header */}
        <Header onOpenAbout={() => setIsAboutOpen(true)} />

        {/* Main Container Stage */}
        <main className="flex-grow max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Error message warning badge */}
        {errorText && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-2xl text-xs flex items-center gap-3"
            id="error-block-alert"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <div className="flex-1">
              <strong>Lỗi phân tích:</strong> {errorText}
              <button 
                onClick={handleReset} 
                className="block mt-1 font-semibold underline text-white hover:text-stone-300 cursor-pointer"
              >
                Nhấp vào đây để thử lại tệp tin khác
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: INITIAL COMPONENT STAGE (No Photo Selected yet) */}
          {!imageSrc && !isAnalyzing && (
            <motion.div
              key="upload-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6 flex-1 flex flex-col justify-center"
            >
              {/* Slogan Banner Block */}
              <div className="text-center space-y-2 mt-4">
                <span className="text-[10px] bg-gradient-to-r from-orange-500 to-purple-500 text-white font-mono px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                  Thần thái ngập tràn
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight leading-tight">
                  Tải ảnh lên. Trí tuệ AI tìm nhạc.<br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-[#d946ef] to-purple-400 animate-pulse" style={{ animationDuration: "4s" }}>
                    Sống động từng khoảnh khắc Story.
                  </span>
                </h2>
                <p className="text-xs text-stone-400 max-w-md mx-auto font-sans leading-relaxed">
                  Thuật toán độc quyền thấu hiểu màu sắc, không khí bối cảnh tại Việt Nam để chọn cho bạn bản nhạc "hợp cạ" đến ngỡ ngàng.
                </p>
              </div>

              {/* Interactive Music Style Preference Options */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md space-y-3.5" id="style-selector-panel">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                    <Music className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-[#fafafa] uppercase tracking-wider font-sans">
                    1. Chọn phong cách âm nhạc muốn hướng tới
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {MUSIC_STYLES.map((style) => {
                    const isSelected = preferredStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setPreferredStyle(style.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer active:scale-95 group overflow-hidden ${
                          isSelected
                            ? "bg-gradient-to-tr from-purple-500/10 to-orange-500/10 border-orange-500/50 text-white shadow-xl shadow-orange-500/5"
                            : "bg-black/30 border-white/5 text-stone-400 hover:text-stone-200 hover:bg-white/5 hover:border-white/10"
                        }`}
                      >
                        {/* Accent check on selection */}
                        {isSelected && (
                          <span className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-tr from-purple-500 to-orange-500 rounded-bl-2xl flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                            ✓
                          </span>
                        )}
                        <span className="text-lg mb-1 block group-hover:scale-110 transition-transform duration-200">
                          {style.icon}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold font-sans tracking-tight block">
                            {style.label.split(" ").slice(0, -1).join(" ")}
                          </h4>
                          <p className="text-[10px] text-stone-500 mt-0.5 font-sans leading-snug line-clamp-1 group-hover:text-stone-400 transition-colors">
                            {style.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drag n Drop Upload Core Box */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-3xl p-8 py-12 text-center border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                  dragActive 
                    ? "border-orange-500 bg-orange-500/5 scale-[1.01]" 
                    : "border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 hover:bg-white/10"
                }`}
                id="photo-upload-dropzone"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden" 
                />

                {uploadProgress !== null ? (
                  <div className="w-full max-w-xs space-y-4 py-4 cursor-default" id="upload-progress-container" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300 font-sans font-semibold flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-orange-400 animate-bounce" /> Đang truyền tải & nén ảnh...
                      </span>
                      <span className="text-amber-400 font-mono font-bold">{uploadProgress}%</span>
                    </div>
                    {/* Linear progress loader */}
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-orange-500 via-[#d946ef] to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 font-sans">
                      Hãy giữ thiết bị ổn định. Chuẩn bị bóc tách bối cảnh...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Sparkling Icon Wrapper */}
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 flex items-center justify-center text-stone-400 group-hover:text-white transition-colors">
                        <Upload className="w-7 h-7 text-stone-300 animate-pulse" />
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 p-1 rounded-lg bg-orange-500 text-white shadow-lg">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white font-sans tracking-tight">Kéo thả bức ảnh của bạn ở đây</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs font-sans">Hoặc nhấp chuột để lựa chọn ảnh từ thư viện thiết bị của bạn</p>
                    <p className="text-[10px] text-stone-600 font-mono mt-3 uppercase tracking-wider">Hỗ trợ JPG, PNG, WEBP lên tới 15MB</p>
                  </>
                )}
              </div>

              {/* Instant Vibe Preset Testers */}
              <DemoVibeTester onSelectPreset={handleSelectPreset} />

              {/* History component of 3-5 images */}
              {history.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md space-y-4" id="recent-user-history-panel">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                        <RefreshCw className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-[#fafafa] uppercase tracking-wider font-sans">
                        Lịch sử ghép nhạc gần đây ({history.length} ảnh)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHistory([]);
                        localStorage.removeItem("story_vibe_history_v2");
                      }}
                      className="text-[10px] uppercase font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Xóa lịch sử
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectHistoryItem(item)}
                        className="p-3 rounded-2xl bg-black/45 border border-white/5 hover:border-orange-500/30 hover:bg-white/5 transition-all cursor-pointer flex gap-3 items-center group relative overflow-hidden"
                      >
                        {/* Miniature thumbnail image */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-stone-900 flex items-center justify-center">
                          <img 
                            src={item.imageSrc} 
                            alt="Historical photo match" 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-115"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Song match detail */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] text-[#ff80ab] bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800 font-semibold block w-fit mb-1 leading-none">
                            {item.imageAnalysis?.detectedWeather || "Trời mát lành 🍃"}
                          </span>
                          {item.selectedSong ? (
                            <>
                              <h4 className="text-xs font-bold text-white font-sans truncate tracking-tight">
                                {item.selectedSong.title}
                              </h4>
                              <p className="text-[10px] text-stone-400 font-sans truncate leading-none mt-0.5">
                                {item.selectedSong.artist}
                              </p>
                            </>
                          ) : (
                            <h4 className="text-xs font-bold text-stone-500 italic">Chưa chọn bài nhạc</h4>
                          )}
                        </div>

                        {/* Hover badge indicator */}
                        <span className="text-[9px] text-stone-500 font-mono absolute bottom-1 right-2 group-hover:text-[#ff80ab] transition-colors">
                          {item.timestamp ? item.timestamp.split(",")[0] : "Xem lại →"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: ANALYZING LOADER MOVEMENT (AI in depth calculation) */}
          {isAnalyzing && (
            <motion.div
              key="loading-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center space-y-6"
              id="ai-loading-screen"
            >
              <div className="relative flex items-center justify-center">
                {/* Outer spin neon ring */}
                <div className="w-24 h-24 rounded-full border-2 border-stone-800 border-t-pink-500 animate-spin" />
                {/* Inter core ring */}
                <div className="absolute w-18 h-18 rounded-full border-2 border-stone-900 border-b-amber-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }} />
                {/* Music key */}
                <Music className="absolute w-7 h-7 text-white animate-bounce" />
              </div>

              <div className="space-y-2 max-w-sm">
                <h4 className="text-sm font-bold text-white font-display tracking-wide uppercase font-sans">AI đang hóa phép màu...</h4>
                {/* Carousel loading state taglines */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingPhraseIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs font-sans text-amber-300 font-semibold leading-relaxed h-8"
                  >
                    {LOADING_PHRASES[loadingPhraseIndex]}
                  </motion.p>
                </AnimatePresence>
                <p className="text-[11px] text-stone-500 font-sans">Tiến trình này thường mất khoảng vài giây. Món quà hoàn chỉnh sắp lộ diện diện!</p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: INTERACTIVE RESULTS WORKSPACE SPLIT STAGE */}
          {imageSrc && !isAnalyzing && (
            <motion.div
              key="results-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
              id="results-workspace"
            >
              {/* LEFT SIDE: Image Insights & AI recommendations listing (7 cols) - ordered 2nd on mobile, 1st on desktop */}
              <div className="md:col-span-7 space-y-6 order-2 md:order-1">
                
                {/* Upload reset controls */}
                <div className="flex items-center justify-between bg-stone-900/60 border border-stone-800 p-3 px-4 rounded-2xl">
                  <span className="text-xs text-stone-400 font-sans font-medium flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-400" /> Đã phân tích ảnh thành công
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-xs font-bold font-sans text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Chọn ảnh khác
                  </button>
                </div>

                {/* Real-time Dynamic Genre Switcher */}
                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-orange-400 font-display uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" /> Thử sức với dòng nhạc khác
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      Cực thông minh
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MUSIC_STYLES.map((style) => {
                      const isSelected = preferredStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => retriggerAnalysisWithStyle(style.id)}
                          className={`px-3 py-2 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2 group-hover:scale-102 ${
                            isSelected
                              ? "bg-gradient-to-r from-orange-500/20 to-purple-500/20 border-orange-500/50 text-[#ff80ab] font-bold shadow-lg"
                              : "bg-black/25 border-white/5 text-stone-400 hover:text-stone-200 hover:bg-white/5"
                          }`}
                        >
                          <span className="text-sm">{style.icon}</span>
                          <span className="font-sans line-clamp-1">{style.label.split(" ")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI Image Insights panel (Mood, detects, rating) */}
                {imageAnalysis && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4" id="ai-insights-box">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-full border border-white/10">
                        <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_#4ade80]"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-200">AI Analysis Complete</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 uppercase font-bold font-sans block leading-none font-semibold font-sans">Chỉ số cảm xúc</span>
                        <span className="text-xs font-black text-[#ff80ab] font-sans mt-0.5 inline-block">{imageAnalysis.vibeRating}</span>
                      </div>
                    </div>

                    {/* Vibe explanation atmosphere */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-stone-400 font-sans uppercase tracking-wider font-semibold">Bầu không khí bức ảnh:</p>
                      <h2 className="text-xl font-extrabold font-display tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
                        {imageAnalysis.atmosphere}
                      </h2>
                    </div>

                    {/* Details row for weather, bối cảnh and colors */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-stone-800/60" id="ai-deep-details-grid">
                      
                      {/* Detected weather */}
                      <div className="space-y-1 mt-1">
                        <span className="text-[10px] text-stone-500 uppercase font-bold block font-sans tracking-wide">Thời tiết gợi ý:</span>
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
                          <span>{imageAnalysis.detectedWeather || "Trần gian lộng gió 🍃"}</span>
                        </div>
                      </div>

                      {/* Detected objects */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-500 uppercase font-bold block font-sans tracking-wide">Phát hiện bối cảnh:</span>
                        <div className="flex flex-wrap gap-1">
                          {imageAnalysis.detectedObjects.map((obj, i) => (
                            <span key={i} className="text-[10.5px] bg-stone-950 text-stone-300 font-medium font-sans px-2.5 py-0.5 rounded border border-stone-800">
                              {obj}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Detected colors palette swatches */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-500 uppercase font-bold block font-sans tracking-wide font-semibold">Bảng màu:</span>
                        <div className="flex gap-1.5 items-center pt-1">
                          {imageAnalysis.dominantColors.map((color, i) => (
                            <div 
                              key={i} 
                              className="w-5 h-5 rounded-md border border-stone-900 shadow-sm transition-transform hover:scale-110"
                              style={{ backgroundColor: color }}
                              title={`Mã màu HEX: ${color}`}
                            />
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Recommendations list */}
                <SongRecommendationsList 
                  recommendations={recommendations}
                  selectedSong={selectedSong}
                  onSelectSong={(song) => {
                    setSelectedSong(song);
                    // Smoothly scroll mobile users back up to see the newly styled story draft instantly
                    const previewEl = document.getElementById("story-preview-container");
                    if (previewEl) {
                      previewEl.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  isDemo={isDemoMode}
                />
              </div>

              {/* RIGHT SIDE: Interactive Portrait Story Preview Stage with Editor (5 cols) - ordered 1st on mobile, 2nd on desktop */}
              <div className="md:col-span-5 md:sticky md:top-24 order-1 md:order-2">
                <StoryPreview
                  imageSrc={imageSrc}
                  selectedSong={selectedSong}
                  onUpdateSong={handleUpdateSelectedSong}
                />
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER: Elegant, pristine custom footer with creator credit */}
      <footer className="w-full border-t border-stone-900 py-6 px-4 bg-stone-950 text-center text-stone-500 text-xs mt-12">
        <div className="max-w-2xl mx-auto space-y-2.5">
          <p className="font-sans font-medium tracking-wide">
            Created by <span className="text-stone-300 font-bold hover:text-pink-400 transition-colors">Trần Hữu Hoàng</span> • Instagram{" "}
            <a 
              href="https://instagram.com/_trh.hoaz_fg" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-500 font-extrabold hover:underline"
            >
              @_trh.hoaz_fg
            </a>
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-stone-600 font-mono">
            <span>STORY VIBE APPLET</span>
            <span>•</span>
            <span>POWERED BY GEMINI 3.5 FLASH</span>
            <span>•</span>
            <span>VIETNAM 2026</span>
          </div>
        </div>
      </footer>

      {/* HELP DETAILS MODAL DRAWER */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </div>
    </div>
  );
}
