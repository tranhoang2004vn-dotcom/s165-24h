/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, CheckCircle2, ChevronRight, Copy, Check, Volume2, VolumeX, RotateCcw, Activity } from "lucide-react";
import { SongRecommendation } from "../types";

interface SongRecommendationsListProps {
  recommendations: SongRecommendation[];
  selectedSong: SongRecommendation | null;
  onSelectSong: (song: SongRecommendation) => void;
  isDemo: boolean;
}

// Function to resolve highly stable, public CDN preview tracks
function getPreviewUrl(song: SongRecommendation): string {
  const title = (song.title || "").toLowerCase();
  const mood = (song.mood || "").toLowerCase();
  
  if (mood.includes("vinahouse") || mood.includes("remix") || mood.includes("giựt") || title.includes("remix") || title.includes("nhạc giựt")) {
    return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3";
  }
  if (mood.includes("rap") || mood.includes("hiphop") || mood.includes("hip-hop") || mood.includes("bụi")) {
    return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";
  }
  if (mood.includes("lofi") || mood.includes("mơ") || mood.includes("hoài niệm")) {
    return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
  }
  if (mood.includes("chill") || mood.includes("healing") || mood.includes("indie") || mood.includes("cà phê")) {
    return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  }
  if (mood.includes("vpop") || mood.includes("love") || title.includes("à lôi") || title.includes("see tình")) {
    return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3";
  }
  
  // Deterministic fallback based on title characters for stable variation
  let charSum = 0;
  for (let i = 0; i < title.length; i++) charSum += title.charCodeAt(i);
  const trackNum = (charSum % 6) + 1; // 1 to 6
  return `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${trackNum}.mp3`;
}

export default function SongRecommendationsList({
  recommendations,
  selectedSong,
  onSelectSong,
  isDemo
}: SongRecommendationsListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Audio Player States
  const [playingTrack, setPlayingTrack] = useState<SongRecommendation | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30); // Previews are capped at 30s
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Initialize hidden audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= 30) {
        // Enforce 30 seconds strict preview ceiling limit
        audio.currentTime = 0;
        audio.pause();
        setIsPlaying(false);
        setCurrentTime(0);
      } else {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleDurationChange = () => {
      const actualDur = audio.duration;
      setDuration(isNaN(actualDur) || actualDur > 30 ? 30 : actualDur);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoadingAudio(true);
    const handleCanPlay = () => setIsLoadingAudio(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Update volume & mute states in actual audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle playing a track
  const togglePlayTrack = (song: SongRecommendation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Avoid choosing the song row if clicking the play trigger only
    
    if (!audioRef.current) return;

    const isSameTrack = playingTrack?.title === song.title && playingTrack?.artist === song.artist;

    if (isSameTrack) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log("Audio playback failed:", err));
      }
    } else {
      // Load and play a new track
      audioRef.current.pause();
      setPlayingTrack(song);
      audioRef.current.src = getPreviewUrl(song);
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log("Audio play failed:", err));
    }
  };

  // Automatically start playing preview when a user selects a song row
  const handleRowSelect = (song: SongRecommendation) => {
    onSelectSong(song);
    // Instant play preview on choose
    if (audioRef.current) {
      const isSameTrack = playingTrack?.title === song.title && playingTrack?.artist === song.artist;
      if (!isSameTrack) {
        audioRef.current.pause();
        setPlayingTrack(song);
        audioRef.current.src = getPreviewUrl(song);
        audioRef.current.load();
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log("Audio auto-play on select failed:", err));
      }
    }
  };

  // Scrub timeline to click location
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercentage = clickX / width;
    const seekTime = clickPercentage * 30; // Limit is 30s
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleCopyCaption = (caption: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card selection
    navigator.clipboard.writeText(caption);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (recommendations.length === 0) {
    return null;
  }

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

      {/* STUNNING MINI STUDIO AUDIO PLAYER */}
      {playingTrack && (
        <div 
          className="p-4 rounded-3xl bg-neutral-950/90 border border-neutral-800 shadow-2xl relative overflow-hidden backdrop-blur-xl transition-all duration-300"
          style={{ borderColor: `${playingTrack.accentColor}30`, boxShadow: `0 8px 32px -8px ${playingTrack.accentColor}25` }}
          id="mini-studio-player"
        >
          {/* Subtle colored accent flow ambient light */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-[0.08] pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: playingTrack.accentColor }}
          />

          <div className="flex flex-col gap-3 relative z-10">
            {/* Top row: details & equalizers */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                {/* Rotating Vinyl Mini Disk */}
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-neutral-800 relative bg-stone-900 overflow-hidden ${
                    isPlaying ? "animate-[spin_6s_linear_infinite]" : ""
                  }`}
                >
                  <div className="absolute inset-1.5 border border-dashed border-stone-700 rounded-full" />
                  <Music className="w-3.5 h-3.5" style={{ color: playingTrack.accentColor }} />
                  <div className="absolute w-2 h-2 rounded-full bg-neutral-950 border border-neutral-800" />
                </div>
                
                <div className="text-left overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md bg-stone-800 text-stone-300 tracking-wider flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"}`} />
                      PREVIEW 30s
                    </span>
                    {isLoadingAudio && (
                      <span className="text-[9px] text-amber-400 font-sans animate-pulse">Đang tải...</span>
                    )}
                  </div>
                  <h4 className="text-white font-extrabold text-sm truncate leading-snug">{playingTrack.title}</h4>
                  <p className="text-stone-400 text-xs font-medium truncate leading-none font-sans mt-0.5">{playingTrack.artist}</p>
                </div>
              </div>

              {/* Dynamic bouncing equalizer bars while playing */}
              {isPlaying && (
                <div className="flex gap-0.5 items-end h-5 px-1 shrink-0">
                  <div className="w-0.5 bg-current rounded-full animate-[equalizerBar_1s_ease-in-out_infinite_alternate]" style={{ color: playingTrack.accentColor }} />
                  <div className="w-0.5 bg-current rounded-full animate-[equalizerBar_0.8s_ease-in-out_infinite_alternate]" style={{ color: playingTrack.accentColor, animationDelay: "0.15s" }} />
                  <div className="w-0.5 bg-current rounded-full animate-[equalizerBar_1.2s_ease-in-out_infinite_alternate]" style={{ color: playingTrack.accentColor, animationDelay: "0.3s" }} />
                  <div className="w-0.5 bg-current rounded-full animate-[equalizerBar_0.6s_ease-in-out_infinite_alternate]" style={{ color: playingTrack.accentColor, animationDelay: "0.45s" }} />
                </div>
              )}
            </div>

            {/* Middle row: Interactive custom seek timeline */}
            <div className="space-y-1">
              <div 
                ref={progressBarRef}
                onClick={handleProgressBarClick}
                className="relative h-1.5 bg-stone-800 rounded-full cursor-pointer group transition-all"
                id="live-seek-timeline"
              >
                {/* Visual filled track */}
                <div 
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-100 ease-out"
                  style={{ 
                    backgroundColor: playingTrack.accentColor,
                    width: `${(currentTime / 30) * 100}%` 
                  }}
                />
                {/* Drag marker hub indicator */}
                <div 
                  className="absolute top-1/2 w-3 h-3 -ml-1.5 rounded-full bg-white shadow-md border hover:scale-110 active:scale-95 transition-transform duration-100"
                  style={{ 
                    left: `${(currentTime / 30) * 100}%`,
                    transform: "translateY(-50%)",
                    borderColor: playingTrack.accentColor
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                <span>{formatTime(currentTime)}</span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-stone-600" /> Cửa sổ nghe thử (30s)
                </span>
                <span>0:30</span>
              </div>
            </div>

            {/* Bottom row: playback control panel knobs */}
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-stone-900 bg-black/10 px-2 py-1 rounded-xl">
              {/* Play Pause buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => togglePlayTrack(playingTrack, e)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white hover:bg-stone-100 text-stone-950 active:scale-90 transition-transform cursor-pointer"
                  title={isPlaying ? "Tạm dừng" : "Nghe thử"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={() => { if (audioRef.current) audioRef.current.currentTime = 0; }}
                  className="p-1 px-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition-all active:scale-90"
                  title="Phát lại từ đầu"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Volume sliders */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-stone-400 hover:text-stone-200 transition-colors p-1"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 sm:w-20 h-1 bg-stone-800 rounded-lg appearance-none cursor-ew-resize accent-stone-300"
                  title="Thay đổi âm lượng"
                />
              </div>
            </div>
          </div>
        </div>
      )}

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
          const isCurrentlyPlaying = playingTrack?.title === song.title && playingTrack?.artist === song.artist;
          const isThisTrackPlaying = isCurrentlyPlaying && isPlaying;
          
          return (
            <div
              key={index}
              onClick={() => handleRowSelect(song)}
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
                {/* Custom Colored music disk trigger / Play Pause */}
                <div 
                  onClick={(e) => togglePlayTrack(song, e)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border relative overflow-hidden shadow-inner transition-transform group-hover:scale-105 duration-200 cursor-pointer ${
                    isSelected ? "text-stone-950" : "text-stone-300 bg-stone-800 border-stone-700"
                  }`}
                  style={isSelected ? { backgroundColor: song.accentColor, borderColor: "transparent" } : undefined}
                  title={isThisTrackPlaying ? "Tạm dừng nghe thử" : "Bấm để nghe thử nhạc này"}
                >
                  {isThisTrackPlaying ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                      {/* Spinning Equalizer Bars */}
                      <div className="flex gap-0.5 items-end h-4">
                        <div className="w-0.5 h-3 bg-stone-950 rounded-full animate-[equalizerBar_1s_ease-in-out_infinite_alternate]" />
                        <div className="w-0.5 h-2 bg-stone-950 rounded-full animate-[equalizerBar_0.8s_ease-in-out_infinite_alternate]" style={{ animationDelay: "0.2s" }} />
                        <div className="w-0.5 h-4.5 bg-stone-950 rounded-full animate-[equalizerBar_1.2s_ease-in-out_infinite_alternate]" style={{ animationDelay: "0.4s" }} />
                        <div className="w-0.5 h-1.5 bg-stone-950 rounded-full animate-[equalizerBar_0.7s_ease-in-out_infinite_alternate]" style={{ animationDelay: "0.1s" }} />
                      </div>
                    </div>
                  ) : isCurrentlyPlaying ? (
                    <Play className="w-4 h-4 text-stone-950 fill-stone-950" />
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
                    {isCurrentlyPlaying && (
                      <span 
                        className="text-[9px] font-bold font-sans flex items-center gap-0.5 leading-none px-1.5 py-0.5 rounded-md border"
                        style={{ borderColor: `${song.accentColor}40`, backgroundColor: `${song.accentColor}10`, color: song.accentColor }}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-neutral-500"}`} />
                        {isPlaying ? "Đang phát thử" : "Tạm dừng thử"}
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
                      )
                    }
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

