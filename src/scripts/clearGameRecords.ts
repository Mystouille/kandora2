import mongoose from "mongoose";
import { config } from "../config";
import { GameRecordModel } from "../db/GameRecord";
import { GameModel } from "../db/Game";

async function main() {
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Clear gameRecord references from all Game documents
  const gameUpdateResult = await GameModel.updateMany(
    { gameRecord: { $ne: null } },
    { $unset: { gameRecord: "" } }
  ).exec();
  console.log(
    `Cleared gameRecord reference from ${gameUpdateResult.modifiedCount} Game document(s).`
  );

  // Delete all GameRecord documents
  const deleteResult = await GameRecordModel.deleteMany({}).exec();
  console.log(`Deleted ${deleteResult.deletedCount} GameRecord document(s).`);

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
