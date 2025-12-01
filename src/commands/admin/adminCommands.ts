import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import {
  invariantResources,
  strings,
} from "../../resources/localization/strings";
import { buildOptionNameAndDescription } from "../../utils/localizationUtils";
import { executeCheckNanikiru } from "./checkNanikiru";

const checkNanikiruSubCommandName =
  invariantResources.commands.admin.checkNanikiru.name;

export const data = new SlashCommandBuilder()
  .setName(invariantResources.commands.admin.name)
  .setDescription(invariantResources.commands.admin.desc)
  .addSubcommand((subcommand) =>
    buildOptionNameAndDescription(
      subcommand,
      strings.commands.admin.checkNanikiru
    ).addIntegerOption((option) =>
      buildOptionNameAndDescription(
        option,
        strings.commands.admin.checkNanikiru.params.id
      ).setRequired(true)
    )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.options.getSubcommand() === checkNanikiruSubCommandName) {
    executeCheckNanikiru(interaction);
  }
}
