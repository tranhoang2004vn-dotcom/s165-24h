/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Music, HelpCircle, Star } from "lucide-react";

interface HeaderProps {
  onOpenAbout: () => void;
}

export default function Header({ onOpenAbout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0a0510]/55 border-b border-white/10 px-4 py-3.5 transition-all">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-orange-500 text-white shadow-lg overflow-hidden animate-pulse">
            <Music className="w-5 h-5 absolute" />
          </div>
          <div>
            <h1 className="text-base font-black font-sans tracking-tight text-white flex items-center gap-1.5 leading-none uppercase">
              Story Vibe
              <span className="text-[10px] bg-gradient-to-r from-orange-500 to-purple-500 text-white font-mono px-1.5 py-0.5 rounded-full uppercase scale-90 tracking-widest font-bold">
                AI
              </span>
            </h1>
            <p className="text-[10px] text-stone-400 font-medium tracking-wide mt-1">Đề xuất nhạc Story xu hướng</p>
          </div>
        </div>

        <button
          onClick={onOpenAbout}
          className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-all duration-200 cursor-pointer active:scale-95"
          id="btn-about"
        >
          <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-sans font-medium">Khám phá</span>
        </button>
      </div>
    </header>
  );
}
