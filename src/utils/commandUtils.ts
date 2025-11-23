import * as ping from "../commands/ping/ping";
import * as createuser from "../commands/createuser/createUser";
import * as mjg from "../commands/mjg/mjgCommands";
import * as quiz from "../commands/quiz/quizCommands";
import * as league from "../commands/league/leagueCommands";
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
  ping,
  createuser,
  mjg,
  quiz,
  league,
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
