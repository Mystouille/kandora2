import mongoose from "mongoose";
import { writeFileSync } from "fs";
import { config } from "../config";
import { MajsoulApi } from "../api/majsoul/data/MajsoulApi";
import { MajsoulConfigModel } from "../db/MajsoulConfig";
import { getPassport } from "../api/majsoul/data/passport";
import { getOrGenerateUserAgent } from "../api/majsoul/data/MajsoulConnector";
import { Cookie } from "../api/majsoul/types/Cookie";
import { Passport } from "../api/majsoul/data/types/Passport";

const GAME_UUID = "260208-6910fdcb-766c-477a-bb98-1c8e86aa0e32";
const OUTPUT_FILE = "gameRecord.json";

async function main() {
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to DB");

  const userAgent = await getOrGenerateUserAgent();
  const [apiConfig] = await MajsoulConfigModel.find().exec();

  const expireDeadline = Date.now() + 60 * 1000;
  const existingCookies = (apiConfig.loginCookies ?? []).filter(
    (cookie) => !cookie.expires || cookie.expires > expireDeadline
  );

  const { passport: dynamicPassport, loginCookies } =
    (await getPassport({
      userId: config.MAJSOUL_UID,
      accessToken: config.MAJSOUL_TOKEN,
      userAgent,
      existingCookies: (existingCookies as Cookie[]) || [],
    })) ?? {};

  await MajsoulConfigModel.updateOne(
    { _id: apiConfig._id },
    { $set: { loginCookies } }
  );

  if (dynamicPassport) {
    await MajsoulConfigModel.updateOne(
      { _id: apiConfig._id },
      { $set: { passportToken: dynamicPassport.accessToken } }
    );
  }

  const passportToken = dynamicPassport?.accessToken ?? apiConfig.passportToken;

  if (!passportToken) {
    console.error("Failed to acquire passport");
    process.exit(1);
  }

  const passport: Passport = {
    accessToken: passportToken,
    uid: config.MAJSOUL_UID,
  };

  const apiResources = await MajsoulApi.retrieveApiResources();
  const api = new MajsoulApi(apiResources!);
  await api.init();
  await api.logIn(passport);

  console.log(`Fetching game ${GAME_UUID}...`);
  const gameRecord = await api.getGame(GAME_UUID);

  console.log(`\nRecords (${gameRecord.records?.length ?? 0}):`);
  for (const [i, record] of (gameRecord.records ?? []).entries()) {
    console.log(`  [${i}] ${record.constructor.name}`);
  }

  // Inject constructor name into each record for the JSON output
  const recordsWithType = (gameRecord.records ?? []).map((record) => ({
    _type: record.constructor.name,
    ...record,
  }));

  // Serialize with a replacer that handles protobuf objects by converting to plain objects
  const json = JSON.stringify(
    { ...gameRecord, records: recordsWithType },
    (_key, value) => {
      if (value instanceof Uint8Array) {
        return Array.from(value);
      }
      return value;
    },
    2
  );

  writeFileSync(OUTPUT_FILE, json, "utf-8");
  console.log(`GameRecord written to ${OUTPUT_FILE}`);

  api.dispose();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
