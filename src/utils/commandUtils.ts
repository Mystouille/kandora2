import * as ping from "../commands/ping/ping";
import * as createuser from "../commands/createuser/createUser";
import * as mjg from "../commands/mjg/mjgCommands";
import * as quizz from "../commands/quizz/quizzCommands";
import { REST, Routes } from "discord.js";
import { config } from "../config";

export const commands = {
  ping,
  createuser,
  mjg,
  quizz,
};

const commandsData = Object.values(commands).map((command) =>
  command.data.toJSON()
);

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export async function deployCommands() {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        config.DISCORD_CLIENT_ID,
        config.DISCORD_GUILD_ID
      ),
      {
        body: commandsData,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
