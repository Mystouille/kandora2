import {
  CommandInteraction,
  Locale,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import {
  invariantResources,
  strings,
} from "../../resources/localization/strings";
import { getLocProps } from "../../utils/localizationUtils";

export const data = new SlashCommandBuilder()
  .setDescription(invariantResources.commands.createuser.desc)
  .setName(invariantResources.commands.createuser.name)
  .setNameLocalizations(getLocProps(strings.commands.createuser.name))
  .setDescriptionLocalizations(getLocProps(strings.commands.createuser.desc));

export async function execute(interaction: CommandInteraction) {
  //const doc = new User({ name: "bla" });
  return interaction.reply({
    content: `pending...`,
    flags: MessageFlags.Ephemeral,
  });
}
