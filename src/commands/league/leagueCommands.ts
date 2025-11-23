import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import {
  invariantResources,
  strings,
} from "../../resources/localization/strings";
import { buildOptionNameAndDescription } from "../../utils/localizationUtils";
import { replyWithDelay } from "../../utils/interactionUtils";
import { createleagueOptions, executeCreateleague } from "./createLeague";
import { Platform, Ruleset } from "../../db/League";

const createLagueSubCommandName =
  invariantResources.commands.league.create.name;

export let data: any = new SlashCommandBuilder()
  .setName(invariantResources.commands.league.name)
  .setDescription(invariantResources.commands.league.name)
  .addSubcommand((sub) =>
    buildOptionNameAndDescription(sub, strings.commands.league.create)
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
        buildOptionNameAndDescription(option, createleagueOptions.endTime)
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(option, createleagueOptions.cutoffTime)
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(option, createleagueOptions.ruleset)
          .setRequired(true)
          .addChoices([
            {
              name: invariantResources.commands.league.create.params.ruleset
                .options.ema,
              value: Ruleset.EMA,
            },
            {
              name: invariantResources.commands.league.create.params.ruleset
                .options.wrc,
              value: Ruleset.WRC,
            },
            {
              name: invariantResources.commands.league.create.params.ruleset
                .options.online,
              value: Ruleset.ONLINE,
            },
            {
              name: invariantResources.commands.league.create.params.ruleset
                .options.mleague,
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
              name: invariantResources.commands.league.create.params.platform
                .options.majsoul,
              value: Platform.MAJSOUL,
            },
            {
              name: invariantResources.commands.league.create.params.platform
                .options.tenhou,
              value: Platform.TENHOU,
            },
            {
              name: invariantResources.commands.league.create.params.platform
                .options.riichiCity,
              value: Platform.RIICHICITY,
            },
            {
              name: invariantResources.commands.league.create.params.platform
                .options.irl,
              value: Platform.IRL,
            },
          ])
          .setRequired(true)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.options.getSubcommand() === createLagueSubCommandName) {
    await replyWithDelay(interaction, {}, executeCreateleague);
  }
}
