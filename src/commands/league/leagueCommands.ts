import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import {
  invariantResources,
  strings,
} from "../../resources/localization/strings";
import { buildOptionNameAndDescription } from "../../utils/localizationUtils";
import { createleagueOptions, executeCreateLeague } from "./createLeague";
import { Platform, Ruleset } from "../../db/League";
import { executeCreateTeam } from "./createTeam";

const createLeagueSubCommandName =
  invariantResources.commands.league.createLeague.name;
const createTeamSubCommandName =
  invariantResources.commands.league.createTeam.name;

export const data = new SlashCommandBuilder()
  .setName(invariantResources.commands.league.name)
  .setDescription(invariantResources.commands.league.name)
  .addSubcommand((sub) =>
    buildOptionNameAndDescription(sub, strings.commands.league.createLeague)
      .addStringOption((option) =>
        buildOptionNameAndDescription(
          option,
          createleagueOptions.leagueName
        ).setRequired(true)
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(
          option,
          createleagueOptions.startTime
        ).setRequired(true)
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(option, createleagueOptions.ruleset)
          .setRequired(true)
          .addChoices([
            {
              name: invariantResources.commands.league.createLeague.params
                .ruleset.options.ema,
              value: Ruleset.EMA,
            },
            {
              name: invariantResources.commands.league.createLeague.params
                .ruleset.options.wrc,
              value: Ruleset.WRC,
            },
            {
              name: invariantResources.commands.league.createLeague.params
                .ruleset.options.online,
              value: Ruleset.ONLINE,
            },
            {
              name: invariantResources.commands.league.createLeague.params
                .ruleset.options.mleague,
              value: Ruleset.MLEAGUE,
            },
          ])
          .setRequired(true)
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(option, createleagueOptions.platform)
          .setRequired(true)
          .addChoices([
            {
              name: invariantResources.commands.league.createLeague.params
                .platform.options.majsoul,
              value: Platform.MAJSOUL,
            },
            {
              name: invariantResources.commands.league.createLeague.params
                .platform.options.tenhou,
              value: Platform.TENHOU,
            },
            {
              name: invariantResources.commands.league.createLeague.params
                .platform.options.riichiCity,
              value: Platform.RIICHICITY,
            },
            {
              name: invariantResources.commands.league.createLeague.params
                .platform.options.irl,
              value: Platform.IRL,
            },
          ])
          .setRequired(true)
      )
      .addChannelOption((option) =>
        buildOptionNameAndDescription(
          option,
          createleagueOptions.adminChannel
        ).setRequired(true)
      )
      .addChannelOption((option) =>
        buildOptionNameAndDescription(
          option,
          createleagueOptions.gameChannel
        ).setRequired(true)
      )
      .addChannelOption((option) =>
        buildOptionNameAndDescription(
          option,
          createleagueOptions.rankingChannel
        ).setRequired(true)
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(option, createleagueOptions.endTime)
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(option, createleagueOptions.cutoffTime)
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(option, createleagueOptions.tournamentId)
      )
  )
  .addSubcommand((sub) =>
    buildOptionNameAndDescription(sub, strings.commands.league.createTeam)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.options.getSubcommand() === createLeagueSubCommandName) {
    interaction.deferReply({ flags: MessageFlags.Ephemeral }).then(async () => {
      await executeCreateLeague(interaction);
    });
  }
  if (interaction.options.getSubcommand() === createTeamSubCommandName) {
    executeCreateTeam(interaction);
  }
}
