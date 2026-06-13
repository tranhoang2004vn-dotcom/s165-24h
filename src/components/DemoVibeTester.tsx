/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sun, Car, Flame, Sparkles } from "lucide-react";
import { PRESET_VIBES, PresetPackage } from "../data/fallbackSongs";

interface DemoVibeTesterProps {
  onSelectPreset: (preset: PresetPackage, mockDataUrl: string) => void;
}

// Generate stylized SVG drawings representing Vietnamese scenes to bypass slow HTTP image assets
const SVGMockIllustration = ({ id }: { id: string }) => {
  if (id === "chill_cafe_sunset") {
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sunset-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB8C00" />
            <stop offset="50%" stopColor="#E91E63" />
            <stop offset="100%" stopColor="#2D112C" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#sunset-grad)" />
        {/* Sun setting */}
        <circle cx="50" cy="55" r="22" fill="#FFE082" opacity="0.9" />
        <circle cx="50" cy="55" r="26" stroke="#FFE082" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        {/* Coffee Cup outline symbol */}
        <path d="M43 65 L57 65 L54 75 L46 75 Z" fill="#5D4037" opacity="0.8" />
        <path d="M57 67 C59 67 60 68 60 70 C60 72 59 73 57 73" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M47 61 Q49 57 48 58 Q50 56 49 55" stroke="#FFE082" strokeWidth="1" strokeLinecap="round" />
        <path d="M51 61 Q53 57 52 58 Q54 56 53 55" stroke="#FFE082" strokeWidth="1" strokeLinecap="round" />
        {/* Simple window panes */}
        <line x1="10" y1="20" x2="10" y2="80" stroke="white" strokeWidth="0.5" opacity="0.3" />
        <line x1="90" y1="20" x2="90" y2="80" stroke="white" strokeWidth="0.5" opacity="0.3" />
        <line x1="10" y1="35" x2="90" y2="35" stroke="white" strokeWidth="0.5" opacity="0.3" />
      </svg>
    );
  }

  if (id === "night_ride") {
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="night-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B091A" />
            <stop offset="60%" stopColor="#1E0F35" />
            <stop offset="100%" stopColor="#05142E" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#night-grad)" />
        {/* Neon City skyline elements in background */}
        <rect x="15" y="45" width="12" height="30" fill="#0D0621" stroke="#E91E63" strokeWidth="0.5" opacity="0.4" />
        <rect x="35" y="30" width="16" height="45" fill="#0E0724" stroke="#00BCD4" strokeWidth="0.5" opacity="0.4" />
        <rect x="65" y="50" width="18" height="25" fill="#09041A" stroke="#E91E63" strokeWidth="0.5" opacity="0.3" />
        {/* Sài Gòn streetlamp bokeh circles */}
        <circle cx="20" cy="40" r="4" fill="#FFE082" opacity="0.6" filter="blur(0.5px)" />
        <circle cx="50" cy="48" r="6" fill="#FF80AB" opacity="0.4" />
        <circle cx="80" cy="38" r="5" fill="#00E5FF" opacity="0.5" />
        {/* Car steering wheel outline in bottom foreground */}
        <circle cx="50" cy="95" r="25" stroke="#37474F" strokeWidth="3" opacity="0.8" />
        <line x1="50" y1="95" x2="50" y2="70" stroke="#37474F" strokeWidth="2.5" opacity="0.8" />
        <line x1="25" y1="95" x2="75" y2="95" stroke="#37474F" strokeWidth="2.5" opacity="0.8" />
        {/* Rain drop lines */}
        <line x1="30" y1="10" x2="25" y2="25" stroke="white" strokeWidth="0.3" opacity="0.4" />
        <line x1="60" y1="15" x2="55" y2="30" stroke="white" strokeWidth="0.3" opacity="0.4" />
        <line x1="15" y1="50" x2="10" y2="65" stroke="white" strokeWidth="0.3" opacity="0.3" />
        <line x1="85" y1="55" x2="80" y2="70" stroke="white" strokeWidth="0.3" opacity="0.3" />
      </svg>
    );
  }

  // Tiệc tùng sôi động / Dj Vinahouse
  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="party-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4A148C" />
          <stop offset="50%" stopColor="#1A0033" />
          <stop offset="100%" stopColor="#080010" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#party-grad)" />
      {/* Laser rays */}
      <line x1="0" y1="0" x2="60" y2="80" stroke="#00E5FF" strokeWidth="0.8" opacity="0.8" />
      <line x1="0" y1="0" x2="90" y2="40" stroke="#FF1744" strokeWidth="0.8" opacity="0.8" />
      <line x1="100" y1="0" x2="15" y2="70" stroke="#AA00FF" strokeWidth="1" opacity="0.6" />
      <line x1="100" y1="0" x2="45" y2="90" stroke="#FFFF00" strokeWidth="0.5" opacity="0.7" />
      {/* Sound waves pulsing */}
      <circle cx="50" cy="50" r="15" stroke="#E040FB" strokeWidth="0.5" opacity="0.6" />
      <circle cx="50" cy="50" r="25" stroke="#FF1744" strokeWidth="1" strokeDasharray="5 2" opacity="0.4" />
      <circle cx="50" cy="50" r="35" stroke="#00E5FF" strokeWidth="0.5" opacity="0.3" />
      {/* Confetti boxes */}
      <rect x="25" y="30" width="3" height="3" fill="#FFFF00" transform="rotate(45 25 30)" opacity="0.8" />
      <rect x="75" y="45" width="2" height="4" fill="#00E5FF" transform="rotate(20 75 45)" opacity="0.9" />
      <circle cx="65" cy="20" r="1.5" fill="#FF1744" opacity="0.8" />
      <circle cx="35" cy="65" r="1" fill="#E040FB" opacity="0.9" />
    </svg>
  );
};

export default function DemoVibeTester({ onSelectPreset }: DemoVibeTesterProps) {
  // Convert illustrations into data URLs dynamically so they can be embedded cleanly into browser <img> and canvas easily
  const handleVibeClick = (preset: PresetPackage) => {
    // Generate simulated high-res gradient base64 to behave exactly like uploaded photo!
    // We will serialize the SVG template content to a base64 encoded URL so React treats it as a real image source!
    let svgMarkup = "";
    if (preset.id === "chill_cafe_sunset") {
      svgMarkup = `
        <svg width="600" height="1066" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#2d112c"/>
          <circle cx="50" cy="45" r="35" fill="none" stroke="#e91e63" stroke-width="0.2"/>
          <circle cx="50" cy="50" r="22" fill="#fb8c00" opacity="0.9"/>
          <circle cx="50" cy="50" r="26" stroke="#ffe082" stroke-width="0.5" stroke-dasharray="2 2" opacity="0.4"/>
          <path d="M43 65 L57 65 L54 75 L46 75 Z" fill="#5D4037" opacity="0.8"/>
          <path d="M47 59 Q49 55 48 56" stroke="#ffe082" stroke-width="0.5"/>
          <path d="M51 59 Q53 55 52 56" stroke="#ffe082" stroke-width="0.5"/>
        </svg>
      `;
    } else if (preset.id === "night_ride") {
      svgMarkup = `
        <svg width="600" height="1066" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#0b091a"/>
          <circle cx="20" cy="40" r="4" fill="#FFE082" opacity="0.6"/>
          <circle cx="50" cy="48" r="6" fill="#FF80AB" opacity="0.4"/>
          <circle cx="80" cy="38" r="5" fill="#00E5FF" opacity="0.5"/>
          <circle cx="50" cy="95" r="25" stroke="#37474F" stroke-width="3" opacity="0.8"/>
          <line x1="30" y1="10" x2="25" y2="25" stroke="white" stroke-width="0.3" opacity="0.4"/>
          <line x1="60" y1="15" x2="55" y2="30" stroke="white" stroke-width="0.3" opacity="0.4"/>
        </svg>
      `;
    } else {
      svgMarkup = `
        <svg width="600" height="1066" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#080010"/>
          <line x1="0" y1="0" x2="60" y2="80" stroke="#00E5FF" stroke-width="0.8" opacity="0.8"/>
          <line x1="0" y1="0" x2="90" y2="40" stroke="#FF1744" stroke-width="0.8" opacity="0.8"/>
          <circle cx="50" cy="50" r="25" stroke="#FF1744" stroke-width="1" stroke-dasharray="5 2" opacity="0.4"/>
        </svg>
      `;
    }

    const cleanSvg = svgMarkup.trim().replace(/\s+/g, " ");
    const base64Data = btoa(unescape(encodeURIComponent(cleanSvg)));
    const dataUrl = `data:image/svg+xml;base64,${base64Data}`;
    
    onSelectPreset(preset, dataUrl);
  };

  const getVibeIcon = (id: string) => {
    switch(id) {
      case "chill_cafe_sunset":
        return <Sun className="w-4.5 h-4.5 text-amber-400" />;
      case "night_ride":
        return <Car className="w-4.5 h-4.5 text-cyan-400" />;
      default:
        return <Flame className="w-4.5 h-4.5 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-4" id="vibe-tester-stage">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold tracking-tight text-white font-sans flex items-center gap-1.5 leading-none">
          <Sparkles className="w-4 h-4 text-amber-300" /> Bản thử nghiệm Vibe không gian
        </h3>
        <p className="text-[11px] text-stone-400 font-sans leading-relaxed">
          Chưa sẵn sàng ảnh chụp của bạn? Hãy click một bối cảnh dựng sẵn dưới đây để xem thuật toán AI đề xuất nhạc ngay lập tức.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {PRESET_VIBES.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleVibeClick(preset)}
            className="group flex flex-col rounded-2xl bg-white/5 border border-white/10 p-2 overflow-hidden hover:border-white/20 hover:bg-white/10 active:scale-95 transition-all text-left duration-200 cursor-pointer"
          >
            {/* Mock Visual representation */}
            <div className="w-full aspect-square rounded-xl bg-black/40 overflow-hidden mb-2 relative">
              <SVGMockIllustration id={preset.id} />
              <div className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/55 backdrop-blur-sm">
                {getVibeIcon(preset.id)}
              </div>
            </div>
            {/* Labels */}
            <h4 className="text-[11px] font-bold text-white font-sans truncate tracking-tight">{preset.name.split("/")[0]}</h4>
            <p className="text-[9px] text-stone-400 font-sans truncate mt-0.5">{preset.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
