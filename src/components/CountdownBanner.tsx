import React, { useState, useEffect } from "react";
import { Clock, Sparkles } from "lucide-react";
import { TournamentConfig } from "../types";

interface CountdownBannerProps {
  config: TournamentConfig;
}

export default function CountdownBanner({ config }: CountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    function calculateTimeLeft() {
      const difference = +new Date(config.countdown_target) - +new Date();
      let timeLeftData = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isOver: true,
      };

      if (difference > 0) {
        timeLeftData = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 65),
          isOver: false,
        };
      }
      return timeLeftData;
    }

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [config.countdown_target]);

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-r from-[#00f2ff]/10 via-[#00f2ff]/5 to-transparent border-b border-[#00f2ff]/20">
      
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 min-h-[3rem]">
        
        {/* Left Info Column */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <Clock className="w-4 h-4 text-[#00f2ff] animate-pulse shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-[11px] font-bold text-[#00f2ff] uppercase tracking-[0.2em] font-sans">
              SEASON 1 KICKOFF IN
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <p className="text-xs font-semibold text-white/80 max-w-md">
              {config.global_announcement || "Nepali Championship Season 1 is open!"}
            </p>
          </div>
        </div>

        {/* Right Timer Grid with the Sleek design aesthetic */}
        <div className="flex items-center gap-4">
          {timeLeft.isOver ? (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#00f2ff]/20 to-transparent border border-[#00f2ff]/30 rounded-lg text-[#00f2ff] font-mono font-bold tracking-widest text-xs animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              TOURNAMENT IS NOW LIVE!
            </div>
          ) : (
            <div className="flex items-baseline space-x-4 font-mono">
              {/* Days */}
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-black text-white">{String(timeLeft.days).padStart(2, "0")}</span>
                <span className="text-[10px] text-white/40 uppercase">Days</span>
              </div>

              <span className="text-white/20 font-bold">:</span>

              {/* Hours */}
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-black text-white">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="text-[10px] text-white/40 uppercase">Hrs</span>
              </div>

              <span className="text-white/20 font-bold">:</span>

              {/* Minutes */}
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-black text-white">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="text-[10px] text-white/40 uppercase">Min</span>
              </div>

              <span className="text-white/20 font-bold">:</span>

              {/* Seconds */}
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-black text-[#00f2ff]">{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className="text-[10px] text-white/40 uppercase">Sec</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
