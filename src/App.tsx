import React, { useState } from "react";
import Header from "./components/Header";
import ComingSoonView from "./components/ComingSoonView";
import Leaderboard from "./components/Leaderboard";
import { generateInitialTournamentState } from "./utils/mockGenerator";
import { TournamentState, GameKey } from "./types";

export default function App() {
  // Initialize dynamic database (supports over 300+ players / 150 Duo Teams seamlessly)
  const [tournamentState, setTournamentState] = useState<TournamentState>(() =>
    generateInitialTournamentState()
  );

  // States to toggle between Coming Soon (countdown) screen and stats boards
  const [isBypassed, setIsBypassed] = useState<boolean>(false);

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
    <div className="min-h-screen bg-[#121212] flex flex-col selection:bg-[#4c8a2b]/40 selection:text-[#ffff55]">
      
      {/* 1. Symmetrical Minimalist Joint Header - Rendered only when active leaderboard stats are unlocked */}
      {isBypassed && <Header />}

      {/* 2. Primary Layout Framework */}
      <div className="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-6 py-8">
        
        {!isBypassed ? (
          /* Mode 1: Symmetrical Coming soon countdown view (Only shows joint partners and remaining days) */
          <ComingSoonView 
            countdownTarget={countdownTarget} 
            onBypass={() => setIsBypassed(true)} 
          />
        ) : (
          /* Mode 2: Minimalist active leaderboard view */
          <main className="w-full flex-1 space-y-6">
            
            {/* Direct subtitle holding MC styles */}
            <div className="border-b-4 border-black pb-4 mb-2">
              <h2 className="font-pixel text-[12px] text-[#ffaa00] mc-shadow-text uppercase leading-relaxed">
                CHAMPIONSHIP LEADERBOARD
              </h2>
            </div>

            {/* Symmetrical Duo Leaderboard Grid */}
            <Leaderboard 
              teams={tournamentState.teams} 
              players={tournamentState.players} 
            />

          </main>
        )}

      </div>

      {/* 3. Sleek minimal pixel foot border block */}
      <footer className="py-6 text-center text-[10px] bg-[#101010] border-t-4 border-black uppercase text-zinc-600 font-pixel mc-shadow-text">
        NML × INFINITY NP
      </footer>

    </div>
  );
}
