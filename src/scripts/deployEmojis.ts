import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config";
import * as fs from "fs";

async function deployEmojis() {
  const emojiDirPath = "./src/resources/emojis/images/";
  const files = fs.readdirSync(emojiDirPath);

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const targetEmojiName = fileName.split(".")[0];

    const appEmojiList = await client.application?.emojis.fetch();

    if (!appEmojiList?.find((emoji) => emoji.name === targetEmojiName)) {
      client.application?.emojis
        .create({
          name: targetEmojiName,
          attachment: emojiDirPath + fileName,
        })
        .then((emoji) =>
          console.log("Created " + emoji.name + " (" + emoji.id + ")")
        )
        .catch((err) =>
          console.log("Couldnt create emoji " + targetEmojiName + ": " + err)
        );
    } else {
      console.log(`All good, ${targetEmojiName} already exist in app`);
    }
  }

  console.log("Refresh finished!");
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  deployEmojis();
});
client.login(config.DISCORD_TOKEN);
