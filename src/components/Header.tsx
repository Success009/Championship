import React from "react";
import { motion } from "motion/react";
import { Award, Volume2, VolumeX } from "lucide-react";
import nmlLogo from "../../Nml_logo.png";
import infLogo from "../../inf.png";

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function Header({ isMuted, onToggleMute }: HeaderProps) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121622]/85 backdrop-blur-md border-b border-[#1f2537] shrink-0 relative py-4 z-40 sticky top-0"
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-row items-center justify-between">
        
        {/* Dynamic Joint Logo Section - Brand symmetry center-aligned of transparent logo graphics */}
        <div className="flex items-center gap-4 select-none">
          <motion.img 
            whileHover={{ scale: 1.05 }}
            src={nmlLogo} 
            alt="NML Logo" 
            className="h-8 sm:h-9 w-auto object-contain smooth-image"
            referrerPolicy="no-referrer"
          />
          
          {/* Symmetrical divider */}
          <span className="text-zinc-600 font-medium text-lg">×</span>

          <motion.img 
            whileHover={{ scale: 1.05 }}
            src={infLogo} 
            alt="Infinity NP Logo" 
            className="h-8 sm:h-9 w-auto object-contain smooth-image"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Action controls / Music & Championship elements */}
        <div className="flex items-center gap-3">
          
          {/* Symmetrical integrated music controller button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleMute}
            className="cursor-pointer h-8.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-2 transition-all text-[10px] sm:text-xs font-bold tracking-wider uppercase select-none font-sans"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="text-rose-400">MUTED</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-blue-400">PLAYING</span>
                <div className="flex gap-0.5 items-end h-2.5 shrink-0">
                  <span className="w-0.5 bg-blue-400/80 h-1.5 rounded-full animate-bounce"></span>
                  <span className="w-0.5 bg-blue-400/80 h-2.5 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-0.5 bg-blue-400/80 h-2 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                </div>
              </>
            )}
          </motion.button>

          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold tracking-widest text-[#f59e0b] uppercase">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            CHAMPIONSHIP
          </span>
        </div>

      </div>
    </motion.header>
  );
}
