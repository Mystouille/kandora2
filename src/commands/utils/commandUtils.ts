import * as ping from "../ping/ping";
import * as createuser from "../createuser/createUser";
import * as mjg from "../mjg/mjgCommands";
import { REST, Routes } from "discord.js";
import { config } from "../../config";

export const commands = {
  ping,
  createuser,
  mjg,
};

const commandsData = Object.values(commands).map((command) =>
  command.data.toJSON(),
);

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export async function deployCommands() {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        config.DISCORD_CLIENT_ID,
        config.DISCORD_GUILD_ID,
      ),
      {
        body: commandsData,
      },
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
