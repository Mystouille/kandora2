import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { config } from "./config";
import mongoose from "mongoose";
import { commands } from "./commands/utils/commandUtils";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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

mongoose
  .connect("mongodb://server:27017/kandora")
  .then(() => {
    console.log(`Connected to db`);
    return client.login(config.DISCORD_TOKEN);
  })
  .then(() => {
    console.log(`Logged in`);
  });
