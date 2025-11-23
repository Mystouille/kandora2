import dotenv from "dotenv";

dotenv.config();

const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID,
  MONGODB_URI,
  MAJSOUL_UID,
  MAJSOUL_TOKEN,
} = process.env;

if (
  !DISCORD_TOKEN ||
  !DISCORD_CLIENT_ID ||
  !DISCORD_GUILD_ID ||
  !MONGODB_URI ||
  !MAJSOUL_UID ||
  !MAJSOUL_TOKEN
) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID,
  MONGODB_URI,
  MAJSOUL_UID,
  MAJSOUL_TOKEN,
};
