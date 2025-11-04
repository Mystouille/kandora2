import {
  CommandInteraction,
  Locale,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { getLocProps } from "../utils/localizationUtils";
import { strings } from "../../resources/localization/strings";
import { stringsEn } from "../../resources/localization/strings-en";

export const data = new SlashCommandBuilder()
  .setDescription(stringsEn.commands.createuser.desc)
  .setName(stringsEn.commands.createuser.name)
  .setNameLocalizations(getLocProps(strings.commands.createuser.name))
  .setDescriptionLocalizations(getLocProps(strings.commands.createuser.desc));

export async function execute(interaction: CommandInteraction) {
  //const doc = new User({ name: "bla" });
  return interaction.reply({
    content: `pending...`,
    flags: MessageFlags.Ephemeral,
  });
}
