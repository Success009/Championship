# Google Cloud Firebase Firestore Migration & Architecture Mapping Plan
**NML x Infinity NP (Nepali Championship Season 1)**

This document details the exact blueprint for graduating our local dashboard state to a fully synchronized serverless Google Cloud Firebase backend.

---

## 1. FIRESTORE DATABASE COLLECTIONS ORG

To optimize for Firestore search, index indexing, query constraints, and real-time read pricing, we segment the centralized state object into three collections:

```
/configs (Collection)
   └── season_1 (Document)
         ├── countdown_target: "2026-09-06T18:00:00Z"
         ├── status: "upcoming"
         └── global_announcement: "Nepali Championship Season 1 registration is live!"

/teams (Collection)
   └── team_01 (Document)
         ├── name: "Himalayan Wolves"
         ├── p1_uuid: "e8e60e86-1a86-4e4b-972d-7d84f9339e1a"
         ├── p1_name: "saugat009"
         ├── p2_uuid: "fb9f826a-939a-4c28-98e3-fa117933be31"
         ├── p2_name: "success009"
         ├── total_points: 240
         └── wins: 3

/players (Collection)
   └── e8e60e86-1a86-4e4b-972d-7d84f9339e1a (Document)
         ├── username: "saugat009"
         ├── team_id: "team_01"
         ├── total_points: 130
         ├── wins: 2
         ├── games_played: 12
         └── game_scores: {
               "battle_royal": 45,
               "bedwars": 50,
               "pvp": 15,
               "parkour": 10,
               "skywars": 10,
               "boat_race": 0
             }
```

---

## 2. SYNCHRONIZATION FLOW & CLIENT RETRIEVAL

When integrating the live Firestore SDK in `App.tsx`, we stream these feeds concurrently using the efficient multi-document `onSnapshot()` listener.

### Real-Time React Client Hook Example:
```typescript
import { db } from "./firebase-init";
import { collection, doc, onSnapshot } from "firebase/firestore";

// Listen to Global Config
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, "configs", "season_1"), (docSnap) => {
    if (docSnap.exists()) {
      setTournamentConfig(docSnap.data());
    }
  });
  return unsubscribe;
}, []);

// Listen to Teams Collection
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "teams"), (querySnapshot) => {
    const teamsData = {};
    querySnapshot.forEach((doc) => {
      teamsData[doc.id] = doc.data();
    });
    setTeams(teamsData);
  });
  return unsubscribe;
}, []);

// Listen to Players Collection
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "players"), (querySnapshot) => {
    const playersData = {};
    querySnapshot.forEach((doc) => {
      playersData[doc.id] = doc.data();
    });
    setPlayers(playersData);
  });
  return unsubscribe;
}, []);
```

---

## 3. DATA INTEGRITY & WRITER TRIGGERS (Cloud Functions)

To prevent teams from spoofing their combined points, the client-side should NEVER directly update `total_points` on `/teams` or `/players` documents.

1. **Purpur Server Plugin / Spigot Plugin Integration:**
   Our dedicated Minecraft Spigot plugin updates player points in individual games using safe REST API calls inside `/api/game-score-update` on a secure Node.js backend proxy.

2. **Firestore Cloud Functions Trigger (Trigger on Player Score Edit):**
   We deploy an automated trigger that recalculates and updates the team standings whenever a player's `game_scores` profile is altered.

```javascript
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.aggregatePlayerScoresToTeam = functions.firestore
  .document("players/{playerId}")
  .onWrite(async (change, context) => {
    const playerData = change.after.data();
    if (!playerData) return null;

    const teamId = playerData.team_id;
    const db = admin.firestore();

    // Sum overall points for both players in the Duo Team
    const playersSnapshot = await db.collection("players")
      .where("team_id", "==", teamId)
      .get();

    let teamSumPoints = 0;
    let teamSumWins = 0;

    playersSnapshot.forEach((doc) => {
      const p = doc.data();
      teamSumPoints += p.total_points || 0;
      teamSumWins += p.wins || 0;
    });

    // Write back aggregate computed value to team document securely
    return db.collection("teams").doc(teamId).update({
      total_points: teamSumPoints,
      wins: teamSumWins,
    });
  });
```

---

## 4. FIRESTORE SECURITY RULES (`firestore.rules`)

To secure the tournament leaderboard, the database is configured in **read-only mode for public clients** and **writeable only for authenticated Minecraft Server hooks** or admin developers:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public tournament dashboard website
    // Allow anyone worldwide to view live ratings and rosters
    match /{document=**} {
      allow read: if true;
      allow write: if false; // Block all direct public writes
    }
    
    // Strict write rules for admin console or authenticated servers
    match /players/{playerId} {
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    match /teams/{teamId} {
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    match /configs/{configId} {
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```
