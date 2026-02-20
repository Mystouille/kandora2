import mongoose from "mongoose";
import { config } from "../config";
import { GameRecordModel } from "../db/GameRecord";

/**
 * Fix GameRecord documents where startTime and endTime were created
 * with `new Date(timestamp)` instead of `new Date(timestamp * 1000)`.
 *
 * Detects affected records by checking if the date is before year 2000
 * (a Unix timestamp in seconds interpreted as milliseconds would be ~1970).
 */
async function main() {
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to DB");

  const cutoff = new Date("2000-01-01T00:00:00Z");

  const badRecords = await GameRecordModel.find({
    $or: [{ startTime: { $lt: cutoff } }, { endTime: { $lt: cutoff } }],
  }).exec();

  console.log(`Found ${badRecords.length} GameRecords with bad timestamps`);

  let updated = 0;
  for (const record of badRecords) {
    const startMs = record.startTime.getTime();
    const endMs = record.endTime.getTime();

    const newStart =
      startMs < cutoff.getTime() ? new Date(startMs * 1000) : record.startTime;
    const newEnd =
      endMs < cutoff.getTime() ? new Date(endMs * 1000) : record.endTime;

    console.log(
      `  ${record.gameId}: ${record.startTime.toISOString()} → ${newStart.toISOString()}, ${record.endTime.toISOString()} → ${newEnd.toISOString()}`
    );

    await GameRecordModel.updateOne(
      { _id: record._id },
      { $set: { startTime: newStart, endTime: newEnd } }
    ).exec();
    updated++;
  }

  console.log(`\nDone. Fixed ${updated} records.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
