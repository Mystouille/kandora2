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
import { executeMyInfo } from "./info";

const myInfoSubCommandName = invariantResources.commands.my.info.name;

export let data: any = new SlashCommandBuilder()
  .setName(invariantResources.commands.my.name)
  .setDescription(invariantResources.commands.my.name)
  .addSubcommand((sub) =>
    buildOptionNameAndDescription(sub, strings.commands.my.info)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.options.getSubcommand() === myInfoSubCommandName) {
    executeMyInfo(interaction);
  }
}
