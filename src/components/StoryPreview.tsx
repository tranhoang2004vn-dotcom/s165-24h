/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Sliders, Type, Palette, Music, Sparkles, Move, Maximize, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { SongRecommendation } from "../types";

interface StoryPreviewProps {
  imageSrc: string; // Base64 data or image url
  selectedSong: SongRecommendation | null;
  onUpdateSong: (updates: Partial<SongRecommendation>) => void;
}

export default function StoryPreview({ imageSrc, selectedSong, onUpdateSong }: StoryPreviewProps) {
  const [copiedType, setCopiedType] = useState<"lyric" | "caption" | null>(null);
  const [textYOffset, setTextYOffset] = useState<number>(50); // percentage from top (starts centrally)
  const [stickerScale, setStickerScale] = useState<number>(1.0); // scale multiplier
  const [stickerXOffset, setStickerXOffset] = useState<number>(0); // horizontal translation in pixels
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownloadImage = async () => {
    const cardElement = document.getElementById("story-preview-card");
    if (!cardElement) return;

    try {
      setIsDownloading(true);
      
      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#000000",
        scale: 3, // Excellent high-resolution export
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `story_vibe_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download image:", error);
      alert("Không thể tải ảnh về máy. Vui lòng thử lại hoặc chụp ảnh màn hình điện thoại nhé!");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!selectedSong) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 rounded-2xl h-96 text-center backdrop-blur-md">
        <Music className="w-10 h-10 text-stone-500 mb-3 animate-bounce" />
        <p className="text-stone-400 font-sans text-sm">Hãy tải ảnh lên để AI đề xuất những bản nhạc tuyệt vời và xem trước định dạng Story tại đây!</p>
      </div>
    );
  }

  const { title, artist, lyricSnippet, caption, accentColor, layoutStyle, fontStyle } = selectedSong;

  // Handle clipboard copy
  const handleCopy = (text: string, type: "lyric" | "caption") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  // Define fonts
  const fontClasses = {
    serif: "font-serif tracking-normal leading-relaxed italic",
    mono: "font-mono text-sm tracking-tighter leading-snug uppercase",
    sans: "font-sans tracking-tight font-medium leading-relaxed",
    display: "font-sans font-black tracking-widest uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white via-stone-100 to-stone-300"
  };

  return (
    <div className="w-full flex flex-col gap-6" id="story-preview-container">
      {/* 9:16 Mockup Stage wrapper */}
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-sans text-stone-400 mb-2 font-semibold uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-orange-400" /> Bản xem trước Story Instagram / TikTok
        </span>
        
        {/* The Actual 9:16 Card */}
        <div 
          id="story-preview-card"
          className="relative w-full max-w-[340px] aspect-[9/16] rounded-3xl bg-black border border-white/10 shadow-2xl overflow-hidden group select-none"
          style={{ boxShadow: `0 25px 50px -12px ${accentColor}25` }}
        >
          {/* Main Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={imageSrc} 
              alt="Story Background" 
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Ambient Dark Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none" />
          </div>

          {/* Insta-style header bar details */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                <div className="w-full h-full bg-stone-900 rounded-full flex items-center justify-center text-[10px] font-bold text-white font-sans uppercase">
                  ME
                </div>
              </div>
              <div>
                <p className="text-[10.5px] font-bold text-white font-sans drop-shadow">Your Story</p>
                <p className="text-[8px] text-stone-300 font-sans drop-shadow font-medium">9s trước • AI Curated</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="w-1 h-1 rounded-full bg-white opacity-80" />
              <div className="w-1 h-1 rounded-full bg-white opacity-80" />
              <div className="w-1 h-1 rounded-full bg-white opacity-80" />
            </div>
          </div>

          {/* Interactive Customizable Music Widget Component */}
          <div 
            className="absolute left-6 right-6 transition-all duration-300"
            style={{ 
              top: `${textYOffset}%`,
              transform: `translateY(-50%) scale(${stickerScale}) translateX(${stickerXOffset}px)`,
              transformOrigin: "center center"
            }}
          >
            {/* Glassmorphic Sticker Container */}
            <div 
              className="backdrop-blur-md rounded-2xl p-4 shadow-xl border overflow-hidden relative flex flex-col items-center text-center justify-center transition-all duration-300"
              style={{ 
                backgroundColor: `${accentColor}1A`, 
                borderColor: `${accentColor}35`,
                boxShadow: `0 10px 30px -5px ${accentColor}15`
              }}
            >
              {/* Spinning Vinyl Disk Layout */}
              {layoutStyle === "vinyl_disk" && (
                <div className="flex flex-col items-center">
                  <div className="relative mb-3 flex items-center justify-center">
                    {/* Retro vinyl shell */}
                    <div 
                      className={`w-20 h-20 rounded-full bg-stone-950 border-4 border-stone-800 flex items-center justify-center shadow-lg relative ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}
                    >
                      {/* Groove lines */}
                      <div className="absolute inset-2 border border-stone-700/50 rounded-full" />
                      <div className="absolute inset-4 border border-stone-700/50 rounded-full" />
                      {/* Rotating center sticker of uploaded photo */}
                      <div className="w-8 h-8 rounded-full bg-cover bg-center overflow-hidden border border-stone-900">
                        <img src={imageSrc} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                    {/* Player tonearm */}
                    <div className="absolute -top-1 -right-2 w-5 h-8 border-t-2 border-r-2 border-stone-400 rounded-tr-md origin-top-left rotate-12" />
                  </div>
                  <h4 className="text-white font-bold text-[14px] tracking-tight leading-tight px-1 font-sans drop-shadow-sm">{title}</h4>
                  <p className="text-stone-300 text-[10.5px] mt-0.5 font-medium leading-none font-sans" style={{ color: `${accentColor}DD` }}>{artist}</p>
                </div>
              )}

              {/* Classic Lyrics Layout with small cassette card */}
              {layoutStyle === "classic_lyrics" && (
                <div className="w-full flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2 bg-stone-950/40 rounded-full px-2.5 py-1 border border-stone-800/60 max-w-full">
                    <Music className="w-3 h-3 text-white shrink-0 animate-bounce" style={{ color: accentColor }} />
                    <span className="text-[10px] font-bold text-white tracking-wide font-sans truncate">{title} • {artist}</span>
                  </div>
                  <p className={`text-white text-base text-center px-1 font-semibold block select-all selection:bg-pink-500 drop-shadow-md ${fontClasses[fontStyle]}`}>
                    "{lyricSnippet}"
                  </p>
                </div>
              )}

              {/* Moving Equalizer Neon Wave Layout */}
              {layoutStyle === "neon_wave" && (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full flex items-center justify-between gap-3 mb-2 bg-stone-950/85 p-2 rounded-xl border border-stone-800">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 shrink-0">
                        <Music className="w-3.5 h-3.5" style={{ color: accentColor }} />
                      </div>
                      <div className="text-left overflow-hidden">
                        <h4 className="text-white font-bold text-[11.5px] leading-tight truncate">{title}</h4>
                        <p className="text-stone-400 text-[8.5px] leading-none truncate">{artist}</p>
                      </div>
                    </div>
                    {/* Equalizer animation bars */}
                    <div className="flex items-end gap-0.5 h-6 shrink-0 px-1">
                      {[0.7, 0.4, 0.9, 0.5, 0.8, 1, 0.4, 0.7].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-0.5 rounded-full"
                          style={{
                            backgroundColor: accentColor,
                            height: isPlaying ? `${h * 100}%` : "15%",
                            animation: isPlaying ? `equalizerBar 1.2s ease-in-out infinite alternate` : "none",
                            animationDelay: `${i * 0.15}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={`text-stone-100 text-sm font-semibold max-w-xs drop-shadow-sm px-1.5 mt-1 text-center ${fontClasses[fontStyle]}`}>
                    "{lyricSnippet}"
                  </p>
                </div>
              )}

              {/* Minimalist Album Polaroid Style Layout */}
              {layoutStyle === "minimalist_album" && (
                <div className="w-full flex flex-col">
                  <div className="w-full aspect-square rounded-lg bg-stone-950/60 overflow-hidden mb-3 border border-stone-800 shadow-inner flex items-center justify-center p-2">
                    <img 
                      src={imageSrc} 
                      className="w-full h-full object-cover rounded-md opacity-90 brightness-95" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-left px-1">
                    <h4 className="text-white font-extrabold text-[13px] font-sans truncate leading-tight">{title}</h4>
                    <p className="text-xs mt-0.5 font-semibold font-sans mb-1" style={{ color: accentColor }}>{artist}</p>
                    <div className="h-[2px] w-12 rounded-full mb-2" style={{ backgroundColor: accentColor }} />
                    <p className={`text-stone-300 text-xs leading-relaxed border-l-2 pl-2 italic ${fontClasses[fontStyle]}`} style={{ borderColor: accentColor }}>
                      "{lyricSnippet}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Swipe indicator at the bottom */}
          <div className="absolute bottom-4 inset-x-0 flex flex-col items-center gap-1.5 pointer-events-none">
            <span className="text-[9px] text-stone-300 tracking-widest font-sans font-bold uppercase drop-shadow">Xem thêm âm nhạc</span>
            <div className="w-5 h-1 rounded-sm bg-stone-200/50 animate-bounce" />
          </div>
        </div>

        {/* Music sound trigger buttons & Download Action */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center items-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 px-3.5 py-2.5 rounded-full transition-all active:scale-95 cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="font-medium font-sans">
              {isPlaying ? "Hiệu ứng động lướt phát" : "Dừng hiệu ứng động"}
            </span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="flex items-center gap-2 text-xs bg-gradient-to-r from-orange-500 via-amber-500 to-purple-600 hover:opacity-90 active:scale-95 transition-all text-white font-bold px-5 py-2.5 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-500/10 border border-white/10"
            id="download-story-btn"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span className="font-sans">Đang xử lý ảnh nét (9:16)...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span className="font-sans">Tải ảnh Story về máy cực nét 📸</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Controls Box */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-5">
        <h3 className="font-bold text-sm tracking-tight text-white font-sans flex items-center gap-2">
          <Sliders className="w-4 h-4 text-orange-400" /> Tùy chỉnh phong cách Story
        </h3>

        {/* Vertical & Horizontal & Size Sliders */}
        <div className="grid grid-cols-1 gap-4 bg-black/20 p-3.5 rounded-2xl border border-white/5">
          {/* Y Axis Drag Simulator Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400 font-sans flex items-center gap-1.5"><Move className="w-3.5 h-3.5 text-stone-500 rotate-90" /> Vị trí Sticker dọc</span>
              <span className="font-mono text-stone-300 font-semibold">{textYOffset}%</span>
            </div>
            <input 
              type="range" 
              min="15" 
              max="85" 
              value={textYOffset} 
              onChange={(e) => setTextYOffset(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-orange-500"
            />
          </div>

          {/* X Axis Position Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400 font-sans flex items-center gap-1.5"><Move className="w-3.5 h-3.5 text-stone-500" /> Vị trí Sticker ngang (X)</span>
              <span className="font-mono text-stone-300 font-semibold">{stickerXOffset > 0 ? `+${stickerXOffset}` : stickerXOffset} px</span>
            </div>
            <input 
              type="range" 
              min="-120" 
              max="120" 
              value={stickerXOffset} 
              onChange={(e) => setStickerXOffset(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-orange-500"
            />
          </div>

          {/* Scale/Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400 font-sans flex items-center gap-1.5"><Maximize className="w-3.5 h-3.5 text-stone-500" /> Kích thước Sticker</span>
              <span className="font-mono text-stone-300 font-semibold">{Math.round(stickerScale * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.10" 
              max="1.0" 
              step="0.05"
              value={stickerScale} 
              onChange={(e) => setStickerScale(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-orange-500"
            />
          </div>
        </div>

        {/* Layout Style Choice */}
        <div className="space-y-2">
          <span className="text-xs text-stone-400 font-sans flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-stone-500" /> Kiểu Layout sticker</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "vinyl_disk", name: "Đĩa xoay Vinyl" },
              { id: "classic_lyrics", name: "Sticker Lyrics" },
              { id: "neon_wave", name: "Sóng EQ Neon" },
              { id: "minimalist_album", name: "Polaroid Album" }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => onUpdateSong({ layoutStyle: st.id as any })}
                className={`py-2 px-3 text-xs rounded-xl font-medium font-sans text-center transition-all border cursor-pointer ${
                  layoutStyle === st.id 
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/50" 
                    : "bg-white/5 text-stone-400 border-white/10 hover:text-stone-200 hover:bg-white/10"
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Font Style Choice */}
        <div className="space-y-2">
          <span className="text-xs text-stone-400 font-sans flex items-center gap-1.5"><Type className="w-3.5 h-3.5 text-stone-500" /> Phông chữ Lyrics</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "serif", name: "Thơ Mộng" },
              { id: "mono", name: "Cá Tính" },
              { id: "sans", name: "Hiện Đại" },
              { id: "display", name: "Rực Rỡ" }
            ].map((ft) => (
              <button
                key={ft.id}
                onClick={() => onUpdateSong({ fontStyle: ft.id as any })}
                className={`py-1.5 text-xs rounded-lg font-medium font-sans text-center transition-all border cursor-pointer ${
                  fontStyle === ft.id
                    ? "bg-purple-500/15 text-purple-400 border-purple-500/50"
                    : "bg-white/5 text-stone-400 border-white/10 hover:text-stone-200 hover:bg-white/10"
                }`}
              >
                {ft.name}
              </button>
            ))}
          </div>
        </div>

        {/* Color Choice */}
        <div className="space-y-2">
          <span className="text-xs text-stone-400 font-sans flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-stone-500" /> Màu sắc chủ đạo (Vibe Color)</span>
          <div className="flex gap-2 flex-wrap items-center">
            {["#FF007F", "#FFAC7D", "#FF9E79", "#00F0FF", "#02C39A", "#9B59B6", "#E67E22", "#F48FB1"].map((col) => (
              <button
                key={col}
                onClick={() => onUpdateSong({ accentColor: col })}
                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 active:scale-95 ${
                  accentColor === col ? "border-white scale-105" : "border-white/10"
                }`}
                style={{ backgroundColor: col }}
                title={col}
              />
            ))}
            <input 
              type="color" 
              value={accentColor} 
              onChange={(e) => onUpdateSong({ accentColor: e.target.value })}
              className="w-7 h-7 rounded-md bg-white/5 border border-white/10 cursor-pointer p-0 overflow-hidden" 
              title="Đổi màu tùy ý"
            />
          </div>
        </div>

        {/* Copy Tools Row */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {/* Copy Lyrics */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider font-sans">Mượn lời bài hát làm sticker chữ</span>
            <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-xs text-stone-300 font-sans italic truncate flex-1">"{lyricSnippet}"</span>
              <button
                onClick={() => handleCopy(lyricSnippet, "lyric")}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-all cursor-pointer active:scale-95"
                title="Sao chép lyrics"
              >
                {copiedType === "lyric" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Copy Caption */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider font-sans">Caption Story viết sẵn siêu cuốn</span>
            <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-xs text-stone-300 font-sans truncate flex-1">{caption}</span>
              <button
                onClick={() => handleCopy(caption, "caption")}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-all cursor-pointer active:scale-95"
                title="Sao chép caption"
              >
                {copiedType === "caption" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
