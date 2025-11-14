import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import {
  invariantResources,
  strings,
} from "../../resources/localization/strings";
import { buildOptionNameAndDescription } from "../../utils/localizationUtils";
import { replyWithDelay } from "../../utils/interactionUtils";
import { executeQuizzNanikiru, nanikiruOptions } from "./nanikiru";
import { NanikiruType } from "../../resources/nanikiru/NanikiruCollections";
import { QuizzMode } from "./QuizzHandler";

const nanikiruSubCommandName = invariantResources.commands.mjg.nanikiru.name;

export let data: any = new SlashCommandBuilder()
  .setName(invariantResources.commands.quizz.name)
  .setDescription(invariantResources.commands.quizz.name)
  .addSubcommand((sub) =>
    buildOptionNameAndDescription(sub, strings.commands.quizz.nanikiru)
      .addIntegerOption((option) =>
        buildOptionNameAndDescription(
          option,
          nanikiruOptions.nbrounds
        ).setRequired(true)
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(option, nanikiruOptions.mode)
          .addChoices([
            {
              name: invariantResources.commands.quizz.nanikiru.params.mode
                .options.explore,
              value: QuizzMode.Explore,
            },
            {
              name: invariantResources.commands.quizz.nanikiru.params.mode
                .options.first,
              value: QuizzMode.First,
            },
            {
              name: invariantResources.commands.quizz.nanikiru.params.mode
                .options.race,
              value: QuizzMode.Race,
            },
          ])
          .setRequired(false)
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(option, nanikiruOptions.series)
          .addChoices([
            {
              name: invariantResources.commands.quizz.nanikiru.params.series
                .options.uzaku301,
              value: NanikiruType.Uzaku301,
            },
            {
              name: invariantResources.commands.quizz.nanikiru.params.series
                .options.uzakuKin,
              value: NanikiruType.UzakuKin,
            },
          ])
          .setRequired(false)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.options.getSubcommand() === nanikiruSubCommandName) {
    await replyWithDelay(interaction, {}, executeQuizzNanikiru);
  }
}
