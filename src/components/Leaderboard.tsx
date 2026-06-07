import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronLeft, ChevronRight, Trophy, Sparkles, Star } from "lucide-react";
import { Team, Player, GameKey } from "../types";

interface LeaderboardProps {
  teams: Record<string, Team>;
  players: Record<string, Player>;
}

export default function Leaderboard({ teams, players }: LeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | GameKey>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Exact literal game mode categories as requested by user
  const CATEGORY_TABS = [
    { key: "all" as const, label: "OVERALL" },
    { key: GameKey.Parkour, label: "PARKOUR" },
    { key: GameKey.BoatRace, label: "BOAT RACE" },
    { key: GameKey.Bedwars, label: "BEDWARS" },
    { key: GameKey.PvP, label: "PVP" },
    { key: GameKey.BattleRoyal, label: "BATTLE ROYALE" },
  ];

  // Compute live scores based on category selection
  const rawLeaderboard = useMemo(() => {
    return Object.entries(teams).map(([id, team]) => {
      const p1 = players[team.p1_uuid];
      const p2 = players[team.p2_uuid];

      let p1Score = 0;
      let p2Score = 0;
      let combinedScore = 0;

      if (activeCategory === "all") {
        p1Score = p1?.total_points || 0;
        p2Score = p2?.total_points || 0;
        combinedScore = team.total_points;
      } else {
        p1Score = p1?.game_scores[activeCategory] || 0;
        p2Score = p2?.game_scores[activeCategory] || 0;
        combinedScore = p1Score + p2Score;
      }

      return {
        id,
        p1_name: team.p1_name,
        p2_name: team.p2_name,
        p1_points: p1Score,
        p2_points: p2Score,
        duo_combined: combinedScore,
      };
    });
  }, [teams, players, activeCategory]);

  // Handle Search Query & Sort (Primary Rank)
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const sorted = [...rawLeaderboard].sort((a, b) => b.duo_combined - a.duo_combined);
    
    if (!q) return sorted;
    return sorted.filter(
      (item) =>
        item.p1_name.toLowerCase().includes(q) ||
        item.p2_name.toLowerCase().includes(q)
    );
  }, [rawLeaderboard, searchQuery]);

  // Pagination bounds
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage]);

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;

  // Premium MCTiers-inspired theme mappings
  const getRankTheme = (rank: number) => {
    if (rank === 1) {
      return {
        badge: "bg-amber-500 text-slate-100 font-black shadow-md",
        p1Name: "text-blue-400 font-extrabold hover:text-blue-300 transition-colors",
        p2Name: "text-rose-400 font-extrabold hover:text-rose-300 transition-colors",
        p1Pts: "text-blue-400/80 font-bold font-mono",
        p2Pts: "text-rose-400/80 font-bold font-mono",
        rowBorder: "mct-row podium-accent-1",
        combinedBg: "bg-amber-500/10 border border-amber-500/20 text-amber-400",
        decor: <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      };
    }
    if (rank === 2) {
      return {
        badge: "bg-sky-400 text-slate-100 font-black shadow-md",
        p1Name: "text-blue-400 font-extrabold hover:text-blue-300 transition-colors",
        p2Name: "text-rose-400 font-extrabold hover:text-rose-300 transition-colors",
        p1Pts: "text-blue-400/80 font-semibold font-mono",
        p2Pts: "text-rose-400/80 font-semibold font-mono",
        rowBorder: "mct-row podium-accent-2",
        combinedBg: "bg-sky-500/10 border border-sky-500/20 text-sky-400",
        decor: <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
      };
    }
    if (rank === 3) {
      return {
        badge: "bg-rose-400 text-slate-100 font-black shadow-md",
        p1Name: "text-blue-400 font-bold hover:text-blue-300 transition-colors",
        p2Name: "text-rose-400 font-bold hover:text-rose-300 transition-colors",
        p1Pts: "text-blue-400/80 font-semibold font-mono",
        p2Pts: "text-rose-400/80 font-semibold font-mono",
        rowBorder: "mct-row podium-accent-3",
        combinedBg: "bg-rose-500/10 border border-rose-500/20 text-rose-400",
        decor: <Star className="w-3.5 h-3.5 text-rose-400 shrink-0" />
      };
    }
    return {
      badge: "bg-slate-800 text-slate-200 font-semibold",
      p1Name: "text-slate-300 font-medium hover:text-blue-400 transition-colors",
      p2Name: "text-slate-300 font-medium hover:text-rose-400 transition-colors",
      p1Pts: "text-slate-400 font-semibold font-mono transition-colors",
      p2Pts: "text-slate-400 font-semibold font-mono transition-colors",
      rowBorder: "mct-row",
      combinedBg: "bg-slate-900 border border-slate-800 text-slate-300",
      decor: null
    };
  };

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Category Switcher Hub - Responsive and slidey tabs */}
      <div className="bg-[#121622] p-1.5 rounded-2xl border border-[#1f2537]">
        <div className="flex flex-wrap gap-1.5 w-full">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveCategory(tab.key);
                  setCurrentPage(1);
                }}
                className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 relative overflow-hidden ${
                  isSelected ? "text-slate-950 font-extrabold" : "text-zinc-400 hover:text-white"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-[#f8fafc] rounded-xl"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sleek Minimal Search Input */}
      <div className="bg-[#121622] rounded-2xl p-4 border border-[#1f2537] flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search team or players..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#0b0d14] border border-[#1f2537] text-white text-xs font-medium rounded-xl px-4 py-3 pl-11 placeholder-zinc-500 outline-none focus:border-slate-700 transition-all"
          />
        </div>
      </div>

      {/* 3. Symmetrical Table with animations */}
      <div className="space-y-3">
        
        {/* Deskop Table Header (hidden on mobile) */}
        <div className="hidden sm:grid grid-cols-12 px-6 py-3.5 bg-[#121622]/40 border border-[#1f2537]/60 rounded-xl font-bold text-xs uppercase tracking-widest text-[#94a3b8]">
          <div className="col-span-1 text-center font-mono">Rank</div>
          <div className="col-span-3 text-left">Player A</div>
          <div className="col-span-2 text-right pr-4 text-zinc-500">Points</div>
          <div className="col-span-2 text-center text-slate-100 font-extrabold">TOTAL</div>
          <div className="col-span-2 text-left pl-4 text-zinc-500">Points</div>
          <div className="col-span-2 text-right">Player B</div>
        </div>

        {/* List of performers */}
        <div className="w-full space-y-2 select-none min-h-[400px]">
          <AnimatePresence mode="popLayout animate">
            {filteredList.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center text-xs text-zinc-500 font-mono tracking-widest uppercase bg-[#121622] border border-[#1f2537] rounded-2xl"
              >
                No matching teams or players found on system registry
              </motion.div>
            ) : (
              paginatedList.map((item, index) => {
                const currentRank = (currentPage - 1) * pageSize + index + 1;
                const { badge, p1Name, p2Name, p1Pts, p2Pts, rowBorder, combinedBg, decor } = getRankTheme(currentRank);

                return (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 420, 
                      damping: 32,
                      opacity: { duration: 0.2 } 
                    }}
                    className={`rounded-2xl p-4 sm:p-0 ${rowBorder}`}
                  >
                    
                    {/* Desktop Symmetrical Row Structure */}
                    <div className="hidden sm:grid grid-cols-12 items-center px-6 py-4 text-sm gap-2">
                      
                      {/* Rank Indicator Badge */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${badge}`}>
                          {currentRank}
                        </span>
                      </div>

                      {/* Player 1 Username (P1 - Blue side) */}
                      <div className="col-span-3 text-left flex items-center gap-2 truncate">
                        <span className={`${p1Name} tracking-wide text-sm truncate`}>
                          {item.p1_name}
                        </span>
                      </div>

                      {/* Player 1 Score */}
                      <div className={`col-span-2 text-right pr-4 ${p1Pts}`}>
                        {item.p1_points} pts
                      </div>

                      {/* Total Score Badge */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className={`px-4 py-1.5 rounded-xl font-bold text-center flex items-center gap-1.5 justify-center min-w-[95px] ${combinedBg}`}>
                          {decor}
                          <span className="font-mono text-sm tracking-tight">{item.duo_combined}</span>
                        </div>
                      </div>

                      {/* Player 2 Score */}
                      <div className={`col-span-2 text-left pl-4 ${p2Pts}`}>
                        {item.p2_points} pts
                      </div>

                      {/* Player 2 Username (P2 - Red side) */}
                      <div className="col-span-2 text-right flex items-center justify-end gap-2 truncate">
                        <span className={`${p2Name} tracking-wide text-sm truncate`}>
                          {item.p2_name}
                        </span>
                      </div>

                    </div>

                    {/* Responsive Mobile-Only Structure */}
                    <div className="sm:hidden flex flex-col space-y-3">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${badge}`}>
                            {currentRank}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-extrabold tracking-widest uppercase flex items-center gap-1">
                            {decor}
                            {currentRank <= 3 ? "Podium Team" : "Arena Entrant"}
                          </span>
                        </div>

                        <div className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono tracking-tight ${combinedBg}`}>
                          {item.duo_combined} PTS
                        </div>
                      </div>

                      {/* Split details */}
                      <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-white/5 text-xs">
                        
                        {/* P1 Section */}
                        <div className="flex flex-col space-y-1.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                            <span className={`truncate ${p1Name}`}>
                              {item.p1_name}
                            </span>
                          </div>
                          <span className={`text-[11px] pl-2.5 ${p1Pts}`}>
                            {item.p1_points} pts
                          </span>
                        </div>

                        {/* P2 Section */}
                        <div className="flex flex-col space-y-1.5 text-right items-end">
                          <div className="flex items-center gap-1.5 justify-end w-full truncate">
                            <span className={`truncate ${p2Name}`}>
                              {item.p2_name}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                          </div>
                          <span className={`text-[11px] pr-2.5 ${p2Pts}`}>
                            {item.p2_points} pts
                          </span>
                        </div>

                      </div>

                    </div>

                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* 4. Sleek Minimal Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 py-2 border-t border-white/5 uppercase select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="cursor-pointer px-4 py-2.5 rounded-xl border border-[#1f2537] bg-[#121622]/60 hover:bg-[#121622] text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[11px] font-semibold flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          
          <span className="text-zinc-400 font-semibold font-mono text-xs text-center min-w-[100px]">
            Page {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="cursor-pointer px-4 py-2.5 rounded-xl border border-[#1f2537] bg-[#121622]/60 hover:bg-[#121622] text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[11px] font-semibold flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
