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
import { executeUpdateMyInfo } from "./update";
import { executeDeleteMyInfo } from "./delete";

const myInfoUpdateSubCommandName =
  invariantResources.commands.myinfo.update.name;
const myInfoDeleteSubCommandName =
  invariantResources.commands.myinfo.delete.name;

export let data: any = new SlashCommandBuilder()
  .setName(invariantResources.commands.myinfo.name)
  .setDescription(invariantResources.commands.myinfo.name)
  .addSubcommand((sub) =>
    buildOptionNameAndDescription(sub, strings.commands.myinfo.update)
  )
  .addSubcommand((sub) =>
    buildOptionNameAndDescription(sub, strings.commands.myinfo.delete)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.options.getSubcommand() === myInfoUpdateSubCommandName) {
    executeUpdateMyInfo(interaction);
  }
  if (interaction.options.getSubcommand() === myInfoDeleteSubCommandName) {
    executeDeleteMyInfo(interaction);
  }
}
