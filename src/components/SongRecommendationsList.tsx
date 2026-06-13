/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Music, Play, CheckCircle2, ChevronRight, Copy, Check } from "lucide-react";
import { SongRecommendation } from "../types";

interface SongRecommendationsListProps {
  recommendations: SongRecommendation[];
  selectedSong: SongRecommendation | null;
  onSelectSong: (song: SongRecommendation) => void;
  isDemo: boolean;
}

export default function SongRecommendationsList({
  recommendations,
  selectedSong,
  onSelectSong,
  isDemo
}: SongRecommendationsListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (recommendations.length === 0) {
    return null;
  }

  const handleCopyCaption = (caption: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card selection
    navigator.clipboard.writeText(caption);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4" id="recommendations-outer-block">
      {/* List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-white font-sans flex items-center gap-2">
          <Music className="w-4 h-4 text-orange-400" />
          Bài hát đề xuất dành riêng cho bạn
        </h3>
        <span className="text-[10px] bg-white/10 text-stone-200 font-mono font-bold px-2.5 py-1 rounded-full uppercase border border-white/10">
          {recommendations.length} Gợi ý
        </span>
      </div>

      {/* Demo warning badge inside suggestions */}
      {isDemo && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200 font-sans leading-normal">
          ⚠️ <strong>Chế độ mô phỏng (Demo):</strong> Do hệ thống chưa phát hiện <code>GEMINI_API_KEY</code> trong cài đặt, danh sách được lọc sẵn từ các bối cảnh âm nhạc hot nhất ở Việt Nam. Bạn vẫn có thể trải nghiệm xem trước Story cực kỳ lung linh!
        </div>
      )}

      {/* Track List */}
      <div className="space-y-3">
        {recommendations.map((song, index) => {
          const isSelected = selectedSong?.title === song.title && selectedSong?.artist === song.artist;
          
          return (
            <div
              key={index}
              onClick={() => onSelectSong(song)}
              className={`p-4 rounded-2xl bg-white/5 border transition-all duration-200 cursor-pointer text-left relative overflow-hidden group select-none active:scale-[0.99] ${
                isSelected 
                  ? "border-white shadow-lg" 
                  : "border-white/10 hover:border-white/20 hover:bg-white/10"
              }`}
              style={isSelected ? { 
                boxShadow: `0 8px 24px -6px ${song.accentColor}25`,
                borderColor: song.accentColor
              } : undefined}
            >
              {/* Highlight background flash when selected */}
              {isSelected && (
                <div 
                  className="absolute inset-0 opacity-[0.03] pointer-events-none transition-all duration-300"
                  style={{ backgroundColor: song.accentColor }}
                />
              )}

              <div className="flex items-start gap-3.5 relative z-10">
                {/* Custom Colored music disk trigger */}
                <div 
                  className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border relative overflow-hidden shadow-inner transition-transform group-hover:scale-105 duration-200 ${
                    isSelected ? "text-stone-950" : "text-stone-300 bg-stone-800 border-stone-700"
                  }`}
                  style={isSelected ? { backgroundColor: song.accentColor, borderColor: "transparent" } : undefined}
                >
                  {isSelected ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                      {/* Spinning Equalizer Bars */}
                      <div className="flex gap-0.5 items-end h-4">
                        <div className="w-0.5 h-3 bg-stone-950 rounded-full animate-[equalizerBar_1s_ease-in-out_infinite_alternate]" />
                        <div className="w-0.5 h-2 bg-stone-950 rounded-full animate-[equalizerBar_0.8s_ease-in-out_infinite_alternate_delay-150]" style={{ animationDelay: "0.2s" }} />
                        <div className="w-0.5 h-4.5 bg-stone-950 rounded-full animate-[equalizerBar_1.2s_ease-in-out_infinite_alternate_delay-300]" style={{ animationDelay: "0.4s" }} />
                        <div className="w-0.5 h-1.5 bg-stone-950 rounded-full animate-[equalizerBar_0.7s_ease-in-out_infinite_alternate_delay-450]" style={{ animationDelay: "0.1s" }} />
                      </div>
                    </div>
                  ) : (
                    <Play className="w-4 h-4 text-stone-400 group-hover:text-white" />
                  )}
                </div>

                {/* Track text metadata */}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span 
                      className="text-[10px] font-bold font-sans px-2 py-0.5 rounded-full select-none"
                      style={{ 
                        backgroundColor: `${song.accentColor}15`, 
                        color: song.accentColor 
                      }}
                    >
                      {song.mood}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] text-emerald-400 font-bold font-sans flex items-center gap-0.5 leading-none bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-900/30">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Lắp vào Story
                      </span>
                    )}
                  </div>

                  <h4 className="text-white font-bold text-sm tracking-tight leading-snug">{song.title}</h4>
                  <p className="text-stone-400 text-xs mt-0.5 font-medium leading-none font-sans">{song.artist}</p>

                  {/* AI Explanation comment block */}
                  <p className="text-stone-300 text-xs font-sans mt-2.5 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="font-extrabold text-[10px] uppercase text-stone-400 tracking-wider">Lý do cực hợp: </span>
                    {song.reason}
                  </p>

                  {/* Copy Caption shortcut directly inside the card */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-stone-400 font-sans italic truncate">" {song.caption} "</span>
                    <button
                      onClick={(e) => handleCopyCaption(song.caption, index, e)}
                      className="p-1 px-2.5 rounded-lg text-[10px] font-medium font-sans bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white flex items-center gap-1.5 transition-all outline-none border border-white/10"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="text-emerald-400">Đã copy</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 shrink-0" />
                          <span>Copy Cap</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="self-center text-stone-600 group-hover:text-stone-400 transition-colors pointer-events-none shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
