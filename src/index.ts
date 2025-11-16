import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { config } from "./config";
import mongoose from "mongoose";
import { commands } from "./utils/commandUtils";
import { AppEmojiCollection } from "./resources/emojis/AppEmojiCollection";
import csv from "csv-parser";
import * as fs from "fs";
import {
  NanikiruCollections,
  NanikiruProblem,
} from "./resources/nanikiru/NanikiruCollections";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    try {
      await commands[commandName as keyof typeof commands].execute(interaction);
    } catch (error) {
      console.error(error);
      const errorMsg = `There was an error while executing this command! \n ${error}`;
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: errorMsg,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: errorMsg,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
});

async function login() {
  return client
    .login(config.DISCORD_TOKEN)
    .then(() => client.application?.emojis.fetch())
    .then(
      (collection) =>
        collection && AppEmojiCollection.instance.setCollection(collection)
    )
    .then(() => {
      const coll = AppEmojiCollection.instance.getCollection();
      console.log(`Fetched emojis (${coll.size})`);
    });
}

const nanikiruProblems: NanikiruProblem[] = [];

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log(`Connected to db`);
  })
  .then(() => {
    fs.createReadStream(
      "src/resources/nanikiru/problems/nanikiruCollection.csv"
    )
      .pipe(csv())
      .on("data", (data: NanikiruProblem) => nanikiruProblems.push(data))
      .on("end", () => {
        nanikiruProblems.sort((a, b) =>
          a.source.toLowerCase() < b.source.toLowerCase() ? -1 : 1
        );
        NanikiruCollections.instance.setCollections(nanikiruProblems);
        console.log(`Fetched nanikiru problems`);
        login();
      });
  });
