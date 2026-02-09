import { Client, Events, GatewayIntentBits } from "discord.js";
import mongoose from "mongoose";
import { config } from "../config";
import { UserModel } from "../db/User";
import { lfcrPlayers } from "../resources/leagueData/lfcrPlayers";

async function updatePlayerDiscordIds() {
  const guild = await client.guilds.fetch(config.DISCORD_GUILD_ID);
  const members = await guild.members.fetch();

  console.log(`Fetched ${members.size} members from guild`);

  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to MongoDB");

  let updated = 0;
  let notFoundInDb = 0;
  let notFoundInDiscord = 0;
  let alreadySet = 0;

  for (const player of lfcrPlayers) {
    // Find user in DB by majsoulIdentity.friendId
    const user = await UserModel.findOne({
      "majsoulIdentity.friendId": player.mahjongSoulId,
    });

    if (!user) {
      console.log(
        `DB user not found for mahjongSoulId: ${player.mahjongSoulId} (${player.discordUserName})`
      );
      notFoundInDb++;
      continue;
    }

    // Find Discord member by username (case-insensitive)
    const discordMember = members.find(
      (m) =>
        m.user.username.toLowerCase() === player.discordUserName.toLowerCase()
    );

    if (!discordMember) {
      console.log(
        `Discord member not found: ${player.discordUserName} (mahjongSoulId: ${player.mahjongSoulId})`
      );
      notFoundInDiscord++;
      continue;
    }

    if (user.discordId === discordMember.id) {
      alreadySet++;
      continue;
    }

    await UserModel.updateOne(
      { _id: user._id },
      { $set: { discordId: discordMember.id } }
    );
    console.log(
      `Updated ${player.nickname}: discordId set to ${discordMember.id}`
    );
    updated++;
  }

  console.log("\n--- Summary ---");
  console.log(`Updated: ${updated}`);
  console.log(`Already set: ${alreadySet}`);
  console.log(`Not found in DB: ${notFoundInDb}`);
  console.log(`Not found in Discord: ${notFoundInDiscord}`);

  await mongoose.disconnect();
  client.destroy();
  process.exit(0);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  updatePlayerDiscordIds().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
});

client.login(config.DISCORD_TOKEN);
