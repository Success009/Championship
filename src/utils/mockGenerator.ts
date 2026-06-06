import { GameKey, TournamentState, Team, Player, GameScores } from "../types";

// Dynamic UUID generator helper
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Collection of cool Minecraft/Nepali themed player names to generate 300 unique players
const MC_WORDS = [
  "Steve", "Alex", "Gorkhali", "Himalayan", "Yeti", "Sherpa", "Kathmandu", "Pokhara", "Lhotse", "Bagmati",
  "NML", "Infinity", "Creeper", "Ender", "Redstone", "Diamond", "Nether", "Spigot", "Purpur", "Block",
  "Miner", "Crafter", "Slayer", "PvP", "Bed", "Sky", "Boat", "Sprint", "Build", "UHC", "Cobble", "Obsidian",
  "Golden", "Warden", "Herobrine", "Portal", "Ghast", "Axe", "Bow", "Elytra"
];

const SECOND_WORDS = [
  "Craft", "Pro", "King", "God", "Elite", "Legend", "Warrior", "Hunter", "Runner", "jumper", "master",
  "slayer", "builder", "miner", "speed", "boy", "nepal", "champ", "titan", "knight", "ranger", "spark"
];

function generateUniqueUsername(index: number): string {
  // Static names for high priority first slots
  if (index === 1) return "saugat009";
  if (index === 2) return "success009";
  if (index === 3) return "nep_steve";
  if (index === 4) return "nitin_pvp";

  const w1 = MC_WORDS[index % MC_WORDS.length];
  const w2 = SECOND_WORDS[Math.floor(index / 3) % SECOND_WORDS.length];
  const num = (index * 13) % 1000;
  return `${w1}_${w2}${num}`;
}

export function generateInitialTournamentState(): TournamentState {
  const teams: Record<string, Team> = {};
  const players: Record<string, Player> = {};

  // We need 150 duo teams (300 players total)
  let pIdx = 1;

  for (let i = 1; i <= 150; i++) {
    const teamId = `team_${i}`;
    
    const p1_name = generateUniqueUsername(pIdx++);
    const p2_name = generateUniqueUsername(pIdx++);

    const uuid1 = generateUUID();
    const uuid2 = generateUUID();

    // Generate balanced realistic game scores
    const p1Scores = generateRandomGameScores(i);
    const p2Scores = generateRandomGameScores(i + 1);

    const p1Total = Object.values(p1Scores).reduce((a, b) => a + b, 0);
    const p2Total = Object.values(p2Scores).reduce((a, b) => a + b, 0);

    const p1Wins = i <= 5 ? Math.floor(6 - i + Math.random() * 2) : Math.floor(Math.random() * 2);
    const p2Wins = i <= 5 ? Math.floor(5 - i + Math.random() * 2) : 0;
    const gamesPlayed = 12;

    players[uuid1] = {
      username: p1_name,
      team_id: teamId,
      total_points: p1Total,
      wins: p1Wins,
      games_played: gamesPlayed,
      game_scores: p1Scores,
    };

    players[uuid2] = {
      username: p2_name,
      team_id: teamId,
      total_points: p2Total,
      wins: p2Wins,
      games_played: gamesPlayed,
      game_scores: p2Scores,
    };

    // The name of the team is literally the combination of the two players' names
    const combinedTeamName = `${p1_name} & ${p2_name}`;

    teams[teamId] = {
      name: combinedTeamName,
      p1_uuid: uuid1,
      p1_name: p1_name,
      p2_uuid: uuid2,
      p2_name: p2_name,
      total_points: p1Total + p2Total,
      wins: p1Wins + p2Wins,
    };
  }

  return {
    tournament_config: {
      countdown_target: "2026-10-11T12:00:00Z", // Target: October 11, 2026
      status: "upcoming",
      global_announcement: "Nepal Minecraft League x Infinity NP Duo Championship October kickoff details released!",
    },
    teams,
    players,
  };
}

function generateRandomGameScores(rankInfluence: number): GameScores {
  // Higher rankInfluence teams (lower index) get naturally higher randomized scores
  const scoreFactor = Math.max(5, 75 - Math.floor(rankInfluence * 0.45));
  
  return {
    [GameKey.BattleRoyal]: Math.floor(Math.random() * scoreFactor + (scoreFactor > 30 ? 20 : 0)),
    [GameKey.Bedwars]: Math.floor(Math.random() * scoreFactor + (scoreFactor > 30 ? 15 : 0)),
    [GameKey.PvP]: Math.floor(Math.random() * (scoreFactor * 0.8) + (scoreFactor > 30 ? 10 : 0)),
    [GameKey.Parkour]: Math.floor(Math.random() * (scoreFactor * 0.7)),
    [GameKey.Skywars]: Math.floor(Math.random() * (scoreFactor * 0.9)),
    [GameKey.BoatRace]: Math.floor(Math.random() * (scoreFactor * 0.6)),
  };
}
