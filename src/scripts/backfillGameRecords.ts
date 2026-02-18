import mongoose from "mongoose";
import { config } from "../config";
import { GameRecordModel } from "../db/GameRecord";
import { GameModel } from "../db/Game";
import { UserModel } from "../db/User";
import { TeamModel } from "../db/Team";

async function main() {
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to DB");

  // Build map: Majsoul account ID (string) → User document
  const users = await UserModel.find({
    "majsoulIdentity.userId": { $exists: true, $ne: null },
  }).exec();
  const majsoulIdToUser = new Map<string, (typeof users)[0]>();
  for (const user of users) {
    const msId = user.majsoulIdentity?.userId;
    if (msId) {
      majsoulIdToUser.set(msId, user);
    }
  }
  console.log(`Loaded ${majsoulIdToUser.size} users with Majsoul IDs`);

  // Load all teams, grouped by member
  const teams = await TeamModel.find().exec();
  // Map: leagueId+userId → team
  const teamLookup = new Map<
    string,
    { teamId: mongoose.Types.ObjectId; teamName: string }
  >();
  for (const team of teams) {
    for (const memberId of team.members) {
      const key = `${team.leagueId.toString()}_${memberId.toString()}`;
      teamLookup.set(key, {
        teamId: team._id as mongoose.Types.ObjectId,
        teamName: team.displayName,
      });
    }
  }
  console.log(`Loaded ${teams.length} teams`);

  const gameRecords = await GameRecordModel.find().exec();
  console.log(`Found ${gameRecords.length} GameRecords to process`);

  let updated = 0;
  let skipped = 0;

  for (const gr of gameRecords) {
    // Find matching Game - either by gameRecord ref or by gameId
    const game = await GameModel.findOne({
      $or: [{ gameRecord: gr._id }, { gameId: gr.gameId }],
    }).exec();

    if (!game) {
      console.log(`  No Game found for GameRecord ${gr.gameId} - skipping`);
      skipped++;
      continue;
    }

    let changed = false;

    for (const ud of gr.byUserData) {
      const userData = ud as any;
      const msUserId = userData.userId as string; // Majsoul account ID string
      const user = majsoulIdToUser.get(msUserId);

      if (!user) {
        continue;
      }

      // Set userDbId
      if (
        !userData.userDbId ||
        userData.userDbId.toString() !== user._id.toString()
      ) {
        userData.userDbId = user._id;
        changed = true;
      }

      // Find matching result in Game
      const result = (game.results as any[])?.find(
        (r) => r.userId?.toString() === user._id.toString()
      );

      if (result) {
        if (userData.score !== result.score) {
          userData.score = result.score;
          changed = true;
        }
        if (userData.place !== result.place) {
          userData.place = result.place;
          changed = true;
        }
      }

      // Find team via league + user
      if (game.league) {
        const key = `${game.league.toString()}_${user._id.toString()}`;
        const teamInfo = teamLookup.get(key);
        if (teamInfo) {
          if (
            !userData.teamDbId ||
            userData.teamDbId.toString() !== teamInfo.teamId.toString()
          ) {
            userData.teamDbId = teamInfo.teamId;
            changed = true;
          }
          if (userData.teamName !== teamInfo.teamName) {
            userData.teamName = teamInfo.teamName;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      await gr.save();
      updated++;
    }
  }

  console.log(
    `\nDone. Updated: ${updated}, Skipped (no matching Game): ${skipped}, Unchanged: ${gameRecords.length - updated - skipped}`
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
