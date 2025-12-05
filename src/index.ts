import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { config } from "./config";
import mongoose from "mongoose";
import { commands, guildCommands } from "./utils/commandUtils";
import { modals } from "./utils/interactionUtils";
import { userContextMenus } from "./utils/interactionUtils";
import { AppEmojiCollection } from "./resources/emojis/AppEmojiCollection";
import { NanikiruCollections } from "./resources/nanikiru/NanikiruCollections";
import { MahjongSoulConnector } from "./api/majsoul/data/MajsoulConnector";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) {
    return;
  }
  const { customId } = interaction;
  try {
    if (modals[customId as keyof typeof modals]) {
      await modals[customId as keyof typeof modals].execute(interaction);
    }
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
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isUserContextMenuCommand()) {
    return;
  }
  const { commandName } = interaction;
  try {
    if (userContextMenus[commandName as keyof typeof userContextMenus]) {
      await userContextMenus[
        commandName as keyof typeof userContextMenus
      ].execute(interaction);
    }
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
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }
  const { commandName } = interaction;
  try {
    if (commands[commandName as keyof typeof commands]) {
      await commands[commandName as keyof typeof commands].execute(interaction);
    }
    if (guildCommands[commandName as keyof typeof guildCommands]) {
      await guildCommands[commandName as keyof typeof guildCommands].execute(
        interaction
      );
    }
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const collection = NanikiruCollections.instance; // Initialize Nanikiru collections

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log(`Connected to db`);
  })
  .then(() => MahjongSoulConnector.instance.init())
  .then(() => {
    login();
  });
