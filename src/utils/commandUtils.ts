import * as mjg from "../commands/mjg/mjgCommands";
import * as quiz from "../commands/quiz/quizCommands";
import * as admin from "../commands/admin/adminCommands";
import * as ping from "../commands/ping/ping";
import * as createuser from "../commands/createuser/createUser";
import { REST, Routes } from "discord.js";
import { config } from "../config";

export enum Ruleset {
  EMA = "EMA",
  WRC = "WRC",
  ONLINE = "ONLINE",
  MLEAGUE = "MLEAGUE",
}
export enum Platform {
  MAJSOUL = "MAJSOUL",
  TENHOU = "TENHOU",
  RIICHICITY = "RIICHICITY",
  IRL = "IRL",
}

export const commands = {
  admin,
  mjg,
  quiz,
};
export const guildCommands = {
  ping,
  createuser,
};

const commandsData = Object.values(commands).map((command) =>
  command.data.toJSON()
);

const guildCommandsData = Object.values(guildCommands).map((command) =>
  command.data.toJSON()
);

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export async function deployCommands() {
  try {
    await rest
      .put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), {
        body: commandsData,
      })
      .then(() => {
        console.log("Successfully reloaded application (/) commands.");
      });

    await rest
      .put(
        Routes.applicationGuildCommands(
          config.DISCORD_CLIENT_ID,
          config.DISCORD_GUILD_ID
        ),
        { body: guildCommandsData }
      )
      .then(() => {
        console.log("Successfully reloaded guild (/) commands.");
      });
  } catch (error) {
    console.error(error);
  }
}
