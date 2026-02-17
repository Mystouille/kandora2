import mongoose from "mongoose";
import { config } from "../config";
import { GameModel } from "../db/Game";
import { UserModel } from "../db/User";

const DISCORD_ID = "340177194779410437";

async function main() {
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to DB");

  const user = await UserModel.findOne({ discordId: DISCORD_ID }).exec();
  if (!user) {
    console.log(`No user found with discordId ${DISCORD_ID}`);
    await mongoose.disconnect();
    return;
  }

  console.log(`User: ${user.name} (DB _id: ${user._id})`);

  const games = await GameModel.find({
    "results.userId": user._id,
  })
    .sort({ startTime: -1 })
    .exec();

  console.log(`\nFound ${games.length} game(s):\n`);

  for (const game of games) {
    const playerResult = game.results?.find(
      (r: any) => r.userId?.toString() === user._id.toString()
    );
    console.log(
      `${game.startTime?.toISOString() ?? "N/A"} | ${game.context} | place: ${playerResult?.place ?? "?"} | score: ${playerResult?.score ?? "?"} | valid: ${game.isValid} | ${game.log ?? ""}`
    );
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
