/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameKey {
  BattleRoyal = "battle_royal",
  Bedwars = "bedwars",
  PvP = "pvp",
  Parkour = "parkour",
  Skywars = "skywars",
  BoatRace = "boat_race",
}

export interface GameScores {
  [GameKey.BattleRoyal]: number;
  [GameKey.Bedwars]: number;
  [GameKey.PvP]: number;
  [GameKey.Parkour]: number;
  [GameKey.Skywars]: number;
  [GameKey.BoatRace]: number;
}

export interface TournamentConfig {
  countdown_target: string;
  status: "upcoming" | "live" | "completed";
  global_announcement: string;
}

export interface Team {
  name: string;
  p1_uuid: string;
  p1_name: string;
  p2_uuid: string;
  p2_name: string;
  total_points: number;
  wins: number;
}

export interface Player {
  username: string;
  team_id: string; // references key in teams
  total_points: number;
  wins: number;
  games_played: number;
  game_scores: GameScores;
}

export interface TournamentState {
  tournament_config: TournamentConfig;
  teams: Record<string, Team>;
  players: Record<string, Player>;
}

export interface ServerStats {
  status: "ONLINE" | "MAINTENANCE" | "OFFLINE";
  activePlayers: number;
  maxPlayers: number;
  tps: number;
  cpuUsage: number;
  ramUsage: number; // in GB
  ramMax: number; // in GB
  ping: number; // in ms
  uptime: string;
}
