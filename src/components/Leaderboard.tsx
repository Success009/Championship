import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
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
  const GAME_TAGS: Record<GameKey, string> = {
    [GameKey.BattleRoyal]: "BATTLE ROYAL",
    [GameKey.Bedwars]: "BEDWARS",
    [GameKey.PvP]: "PVP",
    [GameKey.Parkour]: "PARKOUR",
    [GameKey.Skywars]: "SKYWARS",
    [GameKey.BoatRace]: "ICE BOAT RACING",
  };

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

  // Custom rank background styling presets
  const getRankTheme = (rank: number) => {
    if (rank === 1) return "bg-[#ffff55] text-black border-[#b08100]";
    if (rank === 2) return "bg-[#55ffff] text-black border-[#009fb7]";
    if (rank === 3) return "bg-[#ff5555] text-white border-[#aa0000]";
    return "bg-[#313131] text-zinc-400 border-zinc-650";
  };

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Category Switcher Hub - Grid styling matching Minecraft menus */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        <button
          onClick={() => {
            setActiveCategory("all");
            setCurrentPage(1);
          }}
          className={`mc-button py-2.5 text-[10px] break-keep ${activeCategory === "all" ? "mc-button-active" : ""}`}
        >
          Overall
        </button>

        {Object.entries(GAME_TAGS).map(([key, label]) => {
          const gameKey = key as GameKey;
          const isSelected = activeCategory === gameKey;
          return (
            <button
              key={gameKey}
              onClick={() => {
                setActiveCategory(gameKey);
                setCurrentPage(1);
              }}
              className={`mc-button py-2.5 text-[10px] whitespace-nowrap ${isSelected ? "mc-button-active" : ""}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 2. Responsive Toolbar Slot */}
      <div className="mc-panel bg-[#1f1f1f] border-[#0c0c0c] py-4 px-5 flex flex-row items-center justify-center">
        
        {/* Dynamic Search centered for balanced negative space */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#0a0a0a] border-2 border-black text-white text-xs font-mono rounded px-4 py-2.5 pl-10 placeholder-zinc-600 outline-none focus:border-zinc-500 text-center"
          />
        </div>

      </div>

      {/* 3. Leaderboard Table / Grid Container with distinct Native Mobile layout */}
      <div className="mc-panel bg-[#181818] border-black p-0 overflow-hidden">
        
        {/* Desktop-First Symmetrical Table: Hidden on smaller viewports */}
        <div className="hidden sm:block overflow-x-auto select-none">
          <div className="min-w-[760px] w-full divide-y-2 divide-black">
            
            {/* Exactly structured matching header columns layout */}
            <div className="grid grid-cols-12 px-6 py-3.5 bg-[#101010] font-pixel text-[8px] tracking-wider text-[#ffaa00] mc-shadow-text-gold border-b-4 border-black">
              <div className="col-span-1 text-center">RANK</div>
              <div className="col-span-3 text-left">NAME</div>
              <div className="col-span-2 text-right pr-4">POINT</div>
              <div className="col-span-2 text-center text-[#55ffff]">TOTAL POINTS</div>
              <div className="col-span-2 text-left pl-4">POINTS</div>
              <div className="col-span-2 text-right">NAME</div>
            </div>

            {/* Live Rows */}
            {filteredList.length === 0 ? (
              <div className="py-12 text-center font-pixel text-[8px] text-zinc-650 mc-shadow-text">
                NO DUOS DETECTED ON SYSTEM REGISTRATION
              </div>
            ) : (
              paginatedList.map((item, index) => {
                const currentRank = (currentPage - 1) * pageSize + index + 1;
                const rankTheme = getRankTheme(currentRank);
                
                // Highlight classes for Top 3 performers
                let p1NameStyle = "text-zinc-200 font-bold font-mono";
                let p2NameStyle = "text-zinc-200 font-bold font-mono text-right";

                if (currentRank === 1) {
                  p1NameStyle = "text-[#ffff55] font-black mc-shadow-text";
                  p2NameStyle = "text-[#ffff55] font-black mc-shadow-text text-right";
                } else if (currentRank === 2) {
                  p1NameStyle = "text-[#55ffff] font-black mc-shadow-text";
                  p2NameStyle = "text-[#55ffff] font-black mc-shadow-text text-right";
                } else if (currentRank === 3) {
                  p1NameStyle = "text-[#ff5555] font-black mc-shadow-text";
                  p2NameStyle = "text-[#ff5555] font-black mc-shadow-text text-right";
                }

                return (
                  <div 
                    key={item.id}
                    className="grid grid-cols-12 items-center px-6 py-3 hover:bg-white/5 transition-all text-xs"
                  >
                    {/* Rank Badge Slot */}
                    <div className="col-span-1 flex items-center justify-center">
                      <span className={`w-7 h-7 border-2 rounded flex items-center justify-center font-pixel text-[8px] ${rankTheme}`}>
                        {currentRank}
                      </span>
                    </div>

                    {/* Left Player Username (P1) */}
                    <div className="col-span-3 text-left">
                      <span className={`${p1NameStyle} tracking-wide text-xs truncate flex items-center gap-1.5`}>
                        <span className="w-2 h-2 rounded bg-[#4c8a2b] border border-black inline-block"></span>
                        {item.p1_name}
                      </span>
                    </div>

                    {/* Left Player Points Contribution (P1) */}
                    <div className="col-span-2 text-right pr-4 text-zinc-400 font-mono font-bold">
                      {item.p1_points}
                    </div>

                    {/* Symmetrical Middle: Joint Total Points Badge */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="mc-slot px-3 py-1 rounded min-w-[75px] text-center">
                        <span className="font-pixel text-[9px] text-[#55ff55] mc-shadow-text-green font-bold block">
                          {item.duo_combined}
                        </span>
                      </div>
                    </div>

                    {/* Right Player Points Contribution (P2) */}
                    <div className="col-span-2 text-left pl-4 text-zinc-400 font-mono font-bold">
                      {item.p2_points}
                    </div>

                    {/* Right Player Username (P2) */}
                    <div className="col-span-2 text-right">
                      <span className={`${p2NameStyle} tracking-wide text-xs truncate flex items-center gap-1.5 justify-end`}>
                        {item.p2_name}
                        <span className="w-2.5 h-2.5 rounded bg-[#aa0000] border border-black inline-block"></span>
                      </span>
                    </div>

                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* Custom Mobile-First Symmetrical Interface: Rendered only on phones */}
        <div className="block sm:hidden divide-y-2 divide-black select-none">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center font-pixel text-[8px] text-zinc-650 mc-shadow-text">
              NO DUOS DETECTED ON SYSTEM REGISTRATION
            </div>
          ) : (
            paginatedList.map((item, index) => {
              const currentRank = (currentPage - 1) * pageSize + index + 1;
              const rankTheme = getRankTheme(currentRank);
              
              let p1NameStyle = "text-zinc-200 font-bold font-mono";
              let p2NameStyle = "text-zinc-200 font-bold font-mono";
              
              if (currentRank === 1) {
                p1NameStyle = "text-[#ffff55] font-black mc-shadow-text";
                p2NameStyle = "text-[#ffff55] font-black mc-shadow-text";
              } else if (currentRank === 2) {
                p1NameStyle = "text-[#55ffff] font-black mc-shadow-text";
                p2NameStyle = "text-[#55ffff] font-black mc-shadow-text";
              } else if (currentRank === 3) {
                p1NameStyle = "text-[#ff5555] font-black mc-shadow-text";
                p2NameStyle = "text-[#ff5555] font-black mc-shadow-text";
              }

              return (
                <div 
                  key={item.id} 
                  className="p-4 flex flex-col space-y-3 bg-[#161616] hover:bg-white/5 active:bg-white/5 transition-all text-xs"
                >
                  
                  {/* Row 1: Rank Indicator + Total Combined Duo points in prominent slot */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 border-2 rounded flex items-center justify-center font-pixel text-[8px] ${rankTheme}`}>
                        {currentRank}
                      </span>
                      <span className="font-pixel text-[8px] text-[#ffaa00] tracking-wider uppercase">
                        {currentRank <= 3 ? "🏆 Podium Duo" : "Team Entry"}
                      </span>
                    </div>

                    <div className="mc-slot px-3 py-1 rounded min-w-[80px] text-center">
                      <span className="font-pixel text-[9px] text-[#55ff55] mc-shadow-text-green font-bold block">
                        {item.duo_combined} PTS
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Player A vs Player B Symmetrical Display */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800 text-[11px]">
                    
                    {/* Player A Container */}
                    <div className="flex flex-col space-y-1 border-r border-[#101010] pr-2">
                      <span className={`${p1NameStyle} truncate tracking-wide flex items-center gap-1.5`}>
                        <span className="w-2 h-2 rounded bg-[#4c8a2b] border border-black inline-block shrink-0"></span>
                        {item.p1_name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 font-bold">
                        {item.p1_points} pts
                      </span>
                    </div>

                    {/* Player B Container */}
                    <div className="flex flex-col space-y-1 pl-2 text-right items-end">
                      <span className={`${p2NameStyle} truncate tracking-wide flex items-center gap-1.5 justify-end w-full`}>
                        {item.p2_name}
                        <span className="w-2 h-2 rounded bg-[#aa0000] border border-black inline-block shrink-0"></span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 font-bold">
                        {item.p2_points} pts
                      </span>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 4. Symmetrical Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <span className="text-zinc-650 uppercase font-bold text-[9px] font-pixel tracking-wide">
          REGISTRATION ACTIVE • VERIFIED
        </span>

        <div className="flex items-center gap-2 select-none">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="mc-button py-2 text-[8px] px-3 font-pixel"
          >
            Prev
          </button>
          
          <span className="text-zinc-400 px-3 font-bold font-mono text-[10px] select-none text-center min-w-[110px]">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="mc-button py-2 text-[8px] px-3 font-pixel"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
