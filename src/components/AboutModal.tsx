/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Sparkles, Instagram, Code, Heart, Music, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop wrapper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0f0a1c]/95 border border-white/10 p-6 shadow-2xl backdrop-blur-xl text-stone-100 max-h-[85vh] overflow-y-auto"
            id="about-modal-box"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer border border-white/5"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing gradient background accent */}
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />

            {/* Content header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 border border-white/10 text-orange-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-sans text-white tracking-tight">Về Story Vibe AI</h3>
                <p className="text-xs text-stone-400">Trí Tuệ Nhân Tạo âm nhạc cho giới trẻ Việt</p>
              </div>
            </div>

            {/* About explanation */}
            <div className="space-y-4 text-sm text-stone-300 font-sans leading-relaxed">
              <p>
                <strong>Story Vibe AI</strong> là ứng dụng tiên phong giúp bạn giải phóng sự bối rối khi không biết chọn nhạc gì cho mỗi tấm hình yêu thích trước khi đăng Story.
              </p>
              
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="font-semibold text-xs text-orange-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  <Layers className="w-3.5 h-3.5" /> Bí thuật hoạt động
                </h4>
                <p className="text-xs text-stone-400 leading-normal">
                  Chỉ cần đăng tải ảnh lên, Hoàng và mô hình AI thông minh sẽ cùng nhau bóc tách màu sắc chủ đạo, ngữ cảnh bối cảnh, cảm xúc sâu kín và ánh sáng trong ảnh của bạn để ghép đôi với những bản nhạc Việt Nam lẫn quốc tế đang thịnh hành và chạm lòng nhất. hihi
                </p>
              </div>

              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-xs text-stone-400 uppercase tracking-widest">Thể Loại Thích Nghi</h4>
                <div className="flex flex-wrap gap-1.5">
                  {["V-Pop Trendy", "Nhạc Giựt Giựt", "Vinahouse", "Chill & Healing", "Lofi mộc mạc", "Indie thơ mộng", "CapCut Trend", "Late Night Nightride", "Phố xá Cafe"].map((tag, i) => (
                    <span key={i} className="text-[11px] bg-white/5 text-stone-200 px-2.5 py-1 rounded-full border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Seamless, elegant credit */}
              <div className="pt-6 border-t border-white/10 mt-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs text-stone-400 font-medium">
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ứng dụng được thiết kế & phát triển</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white tracking-wide font-sans">Trần Hữu Hoàng</h4>
                  <p className="text-xs text-stone-500 font-medium font-sans">Sáng tạo nội dung & Đam mê âm nhạc xu hướng</p>
                </div>

                <a
                  href="https://instagram.com/_trh.hoaz_fg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-purple-500 hover:opacity-90 text-white font-medium text-xs px-5 py-2.5 rounded-full shadow-lg transition-all active:scale-95 duration-200 cursor-pointer"
                  id="btn-instagram"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram @_trh.hoaz_fg</span>
                </a>

                <div className="text-[10px] text-stone-600 pt-2 flex items-center gap-1">
                  <span>Made with</span>
                  <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500 animate-ping" />
                  <span>for Vietnam Gen Z • © 2026</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
