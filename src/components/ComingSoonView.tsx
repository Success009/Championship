import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, ArrowRight } from "lucide-react";
import nmlLogo from "../../Nml_logo.png";
import infLogo from "../../inf.png";

interface ComingSoonViewProps {
  countdownTarget: string;
  onBypass: () => void;
}

interface TimeRemaining {
  Days: number;
  Hours: number;
  Minutes: number;
  Seconds: number;
  rawDiff: number;
}

// Synthesis of mechanical woodblock ticking sound
const playTick = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Crisp physical woodblock/picking sound frequency
    osc.type = "sine";
    osc.frequency.setValueAtTime(750, ctx.currentTime);
    
    // Fast decay envelope starting at audible but peaceful volume
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Autoplay browser safety policy blocks contexts until interaction
  }
};

interface DigitUnitProps {
  value: number;
  label: string;
}

function DigitUnit({ value, label }: DigitUnitProps) {
  const formattedValue = String(value).padStart(2, "0");
  return (
    <div className="bg-[#0b0d14]/80 rounded-2xl border border-[#1f2537] px-1 py-3 min-[360px]:px-2.5 sm:p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#38bdf8]/20 transition-all duration-300">
      {/* Symmetrical slider frame */}
      <div className="h-7 sm:h-10 relative w-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formattedValue}
            initial={{ y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -22, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute font-mono text-base min-[360px]:text-lg sm:text-2xl font-black tracking-tight text-slate-100"
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mt-2">
        {label}
      </span>
    </div>
  );
}

export default function ComingSoonView({ countdownTarget, onBypass }: ComingSoonViewProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    Days: 0,
    Hours: 0,
    Minutes: 0,
    Seconds: 0,
    rawDiff: 1,
  });

  const [isHolding, setIsHolding] = useState(false);
  const holdTimeoutRef = React.useRef<any>(null);

  const startHold = () => {
    setIsHolding(true);
    holdTimeoutRef.current = setTimeout(() => {
      onBypass();
    }, 5000);
  };

  const stopHold = () => {
    setIsHolding(false);
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    function calculateCountdown() {
      const target = new Date(countdownTarget);
      const now = new Date();
      const overallDiff = target.getTime() - now.getTime();

      if (overallDiff <= 0) {
        return { Days: 0, Hours: 0, Minutes: 0, Seconds: 0, rawDiff: 0 };
      }

      const Seconds = Math.floor((overallDiff / 1000) % 60);
      const Minutes = Math.floor((overallDiff / (1000 * 60)) % 60);
      const Hours = Math.floor((overallDiff / (1000 * 60 * 60)) % 24);
      const Days = Math.floor(overallDiff / (1000 * 60 * 60 * 24));

      return {
        Days,
        Hours,
        Minutes,
        Seconds,
        rawDiff: overallDiff,
      };
    }

    setTimeLeft(calculateCountdown());
    const interval = setInterval(() => {
      setTimeLeft(calculateCountdown());
    }, 1000);

    return () => {
      clearInterval(interval);
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
    };
  }, [countdownTarget]);

  // Hook into tick sound updates
  useEffect(() => {
    if (timeLeft.rawDiff > 0) {
      playTick();
    }
  }, [timeLeft.Seconds]);

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[70vh]">
      
      {/* Premium minimal card with solid border outlines */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full bg-[#121622] rounded-3xl p-8 sm:p-10 border border-[#1f2537] relative overflow-hidden text-center shadow-2xl"
      >
        
        {/* Subtle, smooth top blue-and-red partnership gradients */}
        <div className="absolute top-0 left-0 w-1/2 h-40 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-1/2 h-40 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none"></div>

        {/* Minimal header badge */}
        <div className="flex justify-center mb-6 border-none outline-none select-none">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300 tracking-wider uppercase">
            Season 1
          </span>
        </div>

        {/* Logos Fusion Frame representing partnership + Secret Bypass Hold gesture */}
        <motion.div 
          animate={isHolding ? { scale: 1.04, borderColor: "rgba(255,255,255,0.15)" } : { scale: 1, borderColor: "rgba(31,37,55,0.5)" }}
          whileHover={{ scale: isHolding ? 1.04 : 1.01 }}
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          className="flex items-center justify-center gap-6 sm:gap-8 bg-[#0b0d14]/60 px-6 py-5 rounded-2xl border mb-8 max-w-md mx-auto cursor-pointer select-none active:scale-[1.02]"
        >
          <div className="relative pointer-events-none">
            <img 
              src={nmlLogo} 
              alt="NML Logo" 
              className="h-14 sm:h-16 w-auto object-contain smooth-image transition-all"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="h-8 w-[1px] bg-slate-800 pointer-events-none"></div>
          <div className="relative pointer-events-none">
            <img 
              src={infLogo} 
              alt="Infinity NP Logo" 
              className="h-14 sm:h-16 w-auto object-contain smooth-image transition-all"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        {/* Title Block */}
        <div className="space-y-2 mb-8 select-none">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            NEPALI CHAMPIONSHIP
          </h1>
          <div className="flex items-center justify-center gap-2 text-[#94a3b8] text-sm">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="font-semibold tracking-wide">OCTOBER 11, 2026</span>
          </div>
        </div>

        {/* Premium Digital Countdown Grid (Animate digit change tick-by-tick) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-4 max-w-md mx-auto select-none">
          <DigitUnit value={timeLeft.Days} label="Days" />
          <DigitUnit value={timeLeft.Hours} label="Hours" />
          <DigitUnit value={timeLeft.Minutes} label="Minutes" />
          <DigitUnit value={timeLeft.Seconds} label="Seconds" />
        </div>

      </motion.div>
    </div>
  );
}
