import {
  CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  TextDisplayBuilder,
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
  const exampleTextDisplay = new TextDisplayBuilder().setContent(
    "### This is a md text"
  );
  return interaction.reply({
    components: [exampleTextDisplay],
    flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
  });
}
