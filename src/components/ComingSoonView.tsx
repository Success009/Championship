import React, { useState, useEffect } from "react";
import nmlLogo from "../../Nml_logo.png";
import infLogo from "../../inf.png";

interface ComingSoonViewProps {
  countdownTarget: string;
  onBypass: () => void;
}

export default function ComingSoonView({ countdownTarget, onBypass }: ComingSoonViewProps) {
  const [preciseTime, setPreciseTime] = useState<string>("");

  useEffect(() => {
    function calculateCountdown() {
      const target = new Date(countdownTarget);
      const now = new Date();
      const overallDiff = target.getTime() - now.getTime();

      if (overallDiff <= 0) {
        return "EVENT IN PROGRESS";
      }

      // Symmetrically advance calendar months step-by-step to be 100% accurate on different month lengths
      let tempDate = new Date(now.getTime());
      let months = 0;

      while (true) {
        const nextMonth = new Date(
          tempDate.getFullYear(),
          tempDate.getMonth() + 1,
          tempDate.getDate(),
          tempDate.getHours(),
          tempDate.getMinutes(),
          tempDate.getSeconds()
        );
        if (nextMonth.getTime() <= target.getTime()) {
          tempDate = nextMonth;
          months++;
        } else {
          break;
        }
      }

      // Calculate remaining exact units on top of the month boundaries
      const remDiff = target.getTime() - tempDate.getTime();
      const seconds = Math.floor((remDiff / 1000) % 60);
      const minutes = Math.floor((remDiff / (1000 * 60)) % 60);
      const hours = Math.floor((remDiff / (1000 * 60 * 60)) % 24);
      const days = Math.floor(remDiff / (1000 * 60 * 60 * 24));

      const parts: string[] = [];
      if (months > 0) {
        parts.push(`${months} month`);
      }
      parts.push(`${days}d`);
      parts.push(`${hours}h`);
      parts.push(`${minutes}min`);
      parts.push(`${seconds}s`);

      return parts.join(" ");
    }

    setPreciseTime(calculateCountdown());
    const interval = setInterval(() => {
      setPreciseTime(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownTarget]);

  return (
    <div className="w-full max-w-xl mx-auto py-10 px-4 flex flex-col items-center justify-center font-sans">
      
      {/* Minecraft-Style Outer GUI Screen Box */}
      <div className="w-full mc-panel text-center relative selection:bg-[#4c8a2b]/30">
        
        {/* Logos Fusion Frame */}
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="flex items-center justify-center gap-4 bg-[#141414] p-4 border-2 border-black rounded shadow-[inset_2px_2px_0px_#050505]">
            <img 
              src={nmlLogo} 
              alt="NML Logo" 
              className="h-16 w-auto object-contain smooth-image"
              referrerPolicy="no-referrer"
            />
            <span className="font-pixel text-xl text-[#ffaa00] mc-shadow-text">×</span>
            <img 
              src={infLogo} 
              alt="Infinity NP Logo" 
              className="h-16 w-auto object-contain smooth-image"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="font-pixel text-[11px] text-zinc-400 leading-relaxed tracking-wider mc-shadow-text-gold uppercase">
            CHAMPIONSHIP EVENT
          </h1>
          
          <span className="font-pixel text-[9px] text-[#55ff55] uppercase tracking-widest mc-shadow-text">
            OCTOBER 11, 2026
          </span>
        </div>

        {/* Days/Hours/Minutes/Seconds Countdown Slot */}
        <div className="mc-slot p-6 mb-8 relative flex flex-col items-center justify-center">
          <span className="block font-pixel text-xl sm:text-2xl text-[#ffff55] tracking-tight leading-snug mc-shadow-text-gold min-h-[35px] flex items-center justify-center">
            {preciseTime || "--"}
          </span>
          <span className="font-pixel text-[8px] uppercase tracking-widest text-zinc-500 block mt-4">
            TIME UNTIL START
          </span>
        </div>

        {/* Minecraft Action Button */}
        <button
          onClick={onBypass}
          className="w-full mc-button py-4 text-xs font-bold font-pixel"
        >
          View Team Stats & Standings
        </button>

        <p className="font-pixel text-[8px] text-zinc-650 mt-5 mc-shadow-text">
          PRE-RELEASE PORTAL
        </p>

      </div>
    </div>
  );
}
