# NML × Infinity NP Championship: Unified System & Database Architecture

This document is the absolute, single-source-of-truth specification for the October 11, 2026 partner Duo Championship. It outlines the Google Firebase Firestore structure, live scoring logic, and UI lockout states. This document is formatted for other AI agents to easily parse, configure, and code the Minecraft Server Spigot/Paper Plugin and automated configurations.

---

## ⚡ 1. System Communication Overview

```
   +---------------------------------------+
   |   MINECRAFT GAME SERVER (Local JVM)    |
   |   - Computes combat, kills, lap times  |
   |   - Uses Firebase Admin SDK (Java)     |
   +----------------------------------+----+
                                      |
                                      | Writes & Updates (Write-Only API)
                                      v
                     +---------------------------------+
                     |   GOOGLE FIREBASE FIRESTORE     |
                     |   - Persistent documents store  |
                     +---------------------------------+
                                      |
                                      | Queries & Pulls (Read-Only client API)
                                      v
   +----------------------------------+----+
   |     LIVE CHANNELS WEB DASHBOARD        |
   |   - Renders teams and countdowns      |
   |   - Re-sorts client side on the fly   |
   +---------------------------------------+
```

1. **Dashboard (Read-Only Access):** The React/Vite dashboard operates entirely in a **Read-Only** consumer mode. It does not write user scores. It subscribes to documents to display overall player statistics dynamically.
2. **Minecraft Server Plugin (Write-Only Access):** The Spigot/Paper Server uses a custom Java/Kotlin plugin configured with the Google Cloud Service Account credential key. Upon match events, it issues authenticated background writes.

---

## 💾 2. Firestore Collection Indexes

The database uses three collections: `players` (individual stats keys), `teams` (aggregated duos), and `metadata` (state machine).

### A. `/players` Collection
* **Document ID Rule:** The document ID **MUST** be the player's Mojang UUID (with or without dashes, consistent throughout).
* **Document Schema:**
```json
{
  "uuid": "String (Mojang UUID)",
  "username": "String (Current Minecraft Username)",
  "total_points": "Integer (Direct sum of all game_scores)",
  "game_scores": {
    "battle_royal": "Integer (Cumulative score in battle royal matches)",
    "bedwars": "Integer (Cumulative score in bedwars matches)",
    "pvp": "Integer (Cumulative score in pvp arena matches)",
    "parkour": "Integer (Cumulative score in parkour levels)",
    "skywars": "Integer (Cumulative score in skywars matches)",
    "boat_race": "Integer (Cumulative score in ice boat races)"
  }
}
```

### B. `/teams` Collection
* **Document ID Rule:** A unique team ID prefix (e.g., `team_001` up to `team_150`).
* **Document Schema:**
```json
{
  "team_id": "String",
  "p1_uuid": "String (Mojang UUID matching /players value)",
  "p1_name": "String (Minecraft Username matching /players value)",
  "p2_uuid": "String (Mojang UUID matching /players value)",
  "p2_name": "String (Minecraft Username matching /players value)",
  "total_points": "Integer (Sum of p1_points and p2_points)",
  "wins": "Integer (Number of match first-place podium conversions)"
}
```

### C. `/metadata` Collection
* **Document Key:** `config` (Contains global parameters to operate countdown states and freeze standings).
* **Document Schema:**
```json
{
  "countdown_target": "Timestamp / ISO String (e.g., '2026-10-11T12:00:00Z')",
  "is_event_active": "Boolean (True = Force un-shields portal; False = Obey countdown)",
  "is_frozen": "Boolean (True = Standings locked under compliance anti-cheat review)",
  "is_closed": "Boolean (True = Event closed, crowns awarded)",
  "closing_announcements": {
    "first_place_team": "String (Team ID of Champ Winners, e.g., 'team_012')",
    "congratulatory_message": "String (Banner string for winner crown)"
  }
}
```

---

## 🏎️ 3. Minigame Points Metrics & Modifiers

The Minecraft Server Plugin must calculate and write scores to Firestore using these exact values:

### A. Battle Royal
* **Kill:** `+4.0 POINTS` per opponent eliminated.
* **Assist:** `+2.0 POINTS` per teammate contribution.
* **Death:** `-1.0 POINT` on lobby knock-out.
* **Victory:** `+25.0 POINTS` for surviving to 1st place.

### B. Bedwars
* **Kill:** `+2.0 POINTS` per combat elimination.
* **Assist:** `+1.0 POINT` per assist.
* **Death:** `-1.0 POINT` upon respawn.
* **Bed Break:** `+15.0 POINTS` for destroying an enemy bed core.
* **Bonus:** `+5.0 POINTS` for keeping the team bed intact past 10 minutes.

### C. PvP Arena
* **Kill:** `+3.0 POINTS` per duel won.
* **Assist:** `+1.5 POINTS` per arena help.
* **Death:** `-2.0 POINTS` on combat loss.
* **Podium:** `+10.0 POINTS` for holding the active King-of-the-Hill crown.

### D. Parkour
* **Fails:** `-0.5 POINT` per checkpoint reset / lava plunge.
* **Cleared:** `+2.0 POINTS` per level stage successfully finished.
* **Top Speed:** `+30.0 POINTS` bonus for setting the fastest course record.

### E. Skywars
* **Kill:** `+3.0 POINTS` per void knock or bow hit.
* **Assist:** `+1.0 POINT` per assist helper value.
* **Death:** `-1.0 POINT` on island fall.
* **Victory:** `+15.0 POINTS` for target survival completion.

### F. Ice Boat Racing
* **Crash:** `-1.0 POINT` for hitting walls forcing boat resets.
* **Smooth Lap:** `+20.0 POINTS` on completing a flawless blue ice loop without resets.
* **First Podium:** `+30.0 POINTS` for placing 1st place in the heat finals.

---

## 🔒 4. Lockout States on the Dashboard

Your web client is programmed to react to the `/metadata/config` state:

1. **Active Countdown:**
   * Calculated by: `countdown_target - current_time`.
   * Until countdown target is reached, the UI presents an immersive coming-soon panel showing exact Months, Days, Hours, Minutes, and Seconds.
2. **Standings Freeze:**
   * If `is_frozen == true`, the frontend overlays a locked shield saying: `"STANDINGS SECURED: FINAL COMPLIANCE VERIFICATION IN PROGRESS"`. This freezes the standings to prevent any edits or leakage.
3. **Closing Ceremony:**
   * If `is_closed == true`, the dashboard renders dynamic trophy blocks and fireworks, highlighting team winners and overall MVPs based on aggregate data.
