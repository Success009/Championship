import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Header from "./components/Header";
import ComingSoonView from "./components/ComingSoonView";
import Leaderboard from "./components/Leaderboard";
import { generateInitialTournamentState } from "./utils/mockGenerator";
import { TournamentState, GameKey } from "./types";
import { Sparkles, Trophy, Volume2, VolumeX } from "lucide-react";
import bracketedGlory from "../Bracketed Glory.mp3";

export default function App() {
  // Initialize dynamic database (supports over 300+ players / 150 Duo Teams seamlessly)
  const [tournamentState, setTournamentState] = useState<TournamentState>(() =>
    generateInitialTournamentState()
  );

  // States to toggle between Coming Soon (countdown) screen and stats boards
  const [isBypassed, setIsBypassed] = useState<boolean>(false);

  // Background music orchestration
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem("musicMuted") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const audio = new Audio(bracketedGlory);
    audio.loop = true;
    audio.volume = 0.45; // Audible ambient level, not blasting
    
    // Set immediate muted state matching localStorage
    try {
      audio.muted = localStorage.getItem("musicMuted") === "true";
    } catch {
      audio.muted = false;
    }
    
    audioRef.current = audio;

    const playAudio = () => {
      audio.play().catch((err) => {
        console.log("Autoplay deferred. Waiting for interactive gesture.", err);
      });
    };

    playAudio();

    // Trigger audio resume on general page click
    const handleGesture = () => {
      if (audio.paused) {
        playAudio();
      }
      window.removeEventListener("click", handleGesture);
    };
    window.addEventListener("click", handleGesture);

    return () => {
      audio.pause();
      window.removeEventListener("click", handleGesture);
    };
  }, []);

  // Sync state mutation to element properties and update localStorage
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    try {
      localStorage.setItem("musicMuted", String(isMuted));
    } catch (e) {
      // Ignored
    }
  }, [isMuted]);

  // Core event start target: October 11, 2026
  const countdownTarget = "2026-10-11T12:00:00Z";

  // Match score random incremental calculation for sandbox simulation
  const handleTriggerEventSimulation = () => {
    setTournamentState((prevState) => {
      const updatedTeams = { ...prevState.teams };
      const updatedPlayers = { ...prevState.players };

      // Select 6 random teams to increment live stats
      const allTeamIds = Object.keys(updatedTeams);
      const shuffled = [...allTeamIds].sort(() => 0.5 - Math.random());
      const selectedTeamIds = shuffled.slice(0, 6);

      const games = Object.values(GameKey);

      selectedTeamIds.forEach((tId) => {
        const team = updatedTeams[tId];
        if (!team) return;

        const randomGame = games[Math.floor(Math.random() * games.length)];
        const pointsAdded = Math.floor(Math.random() * 16) + 10; // add +10 to +25 points

        const p1 = updatedPlayers[team.p1_uuid];
        if (p1) {
          p1.total_points += Math.floor(pointsAdded / 2);
          p1.game_scores[randomGame] = (p1.game_scores[randomGame] || 0) + Math.floor(pointsAdded / 2);
        }

        const p2 = updatedPlayers[team.p2_uuid];
        if (p2) {
          p2.total_points += Math.ceil(pointsAdded / 2);
          p2.game_scores[randomGame] = (p2.game_scores[randomGame] || 0) + Math.ceil(pointsAdded / 2);
        }

        updatedTeams[tId] = {
          ...team,
          total_points: team.total_points + pointsAdded,
          wins: Math.random() > 0.82 ? team.wins + 1 : team.wins,
        };
      });

      return {
        ...prevState,
        teams: updatedTeams,
        players: updatedPlayers,
      };
    });
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300 relative">
      
      {/* 1. Integrated Header with sound controller always accessible at the top */}
      <Header isMuted={isMuted} onToggleMute={() => setIsMuted((p) => !p)} />

      {/* 2. Primary Layout Framework */}
      <div className="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-6 py-8 relative z-10">
        
        <AnimatePresence mode="wait">
          {!isBypassed ? (
            /* Mode 1: Countdown entrance screen */
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full flex justify-center"
            >
              <ComingSoonView 
                countdownTarget={countdownTarget} 
                onBypass={() => setIsBypassed(true)} 
              />
            </motion.div>
          ) : (
            /* Mode 2: Minimalist active leaderboard view */
            <motion.main 
              key="leaderboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full flex-1 space-y-6"
            >
              
              {/* Modernized Elegant Title Header */}
              <div className="border-b border-white/5 pb-5 mb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Trophy className="w-4 h-4" />
                    <span className="text-[11px] font-extrabold uppercase tracking-widest font-mono">Arena Season 1 Group Stage</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                    CHAMPIONSHIP LEADERBOARD
                  </h1>
                </div>
              </div>

              {/* Duo Leaderboard Grid */}
              <Leaderboard 
                teams={tournamentState.teams} 
                players={tournamentState.players} 
              />

            </motion.main>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
