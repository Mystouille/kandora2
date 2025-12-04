import {
  ChatInputCommandInteraction,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} from "discord.js";
import {
  invariantResources,
  strings,
} from "../../resources/localization/strings";
import { getLocProps } from "../../utils/localizationUtils";
import { League } from "../../db/League";

export const data = new SlashCommandBuilder()
  .setDescription(invariantResources.commands.createuser.desc)
  .setName(invariantResources.commands.createuser.name)
  .setNameLocalizations(getLocProps(strings.commands.createuser.name))
  .setDescriptionLocalizations(getLocProps(strings.commands.createuser.desc));

export async function executeCreateTeam(itr: ChatInputCommandInteraction) {
  const league = await League.findOne({ isOngoing: true }).exec();

  if (league === null) {
    await itr.reply({
      content: "There is no ongoing league to register a team for.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const captainSelect = new UserSelectMenuBuilder()
    .setCustomId("captain")
    .setPlaceholder("Select the team's captain")
    .setMaxValues(1)
    .setRequired(true);
  const teamSelect = new UserSelectMenuBuilder()
    .setCustomId("teamMembers")
    .setPlaceholder("Select the team's members")
    .setMaxValues(5)
    .setRequired(false);

  const teamNameInput = new TextInputBuilder()
    .setCustomId("teamName")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder(
      "Enter a basic team name (no spaces or special characters)"
    );
  const fancyTeamNameInput = new TextInputBuilder()
    .setCustomId("fancyTeamName")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder("Enter a fancy team name (emojis allowed)");
  const modal = new ModalBuilder()
    .setCustomId("createTeamModal")
    .setTitle("Create a new team")
    .addLabelComponents((components) =>
      new LabelBuilder()
        .setLabel("Team name")
        .setTextInputComponent(teamNameInput)
    )
    .addLabelComponents((components) =>
      new LabelBuilder()
        .setLabel("Fancy team name")
        .setTextInputComponent(fancyTeamNameInput)
    )
    .addLabelComponents((components) =>
      new LabelBuilder()
        .setLabel("Team Captain")
        .setUserSelectMenuComponent(captainSelect)
    )
    .addLabelComponents((components) =>
      new LabelBuilder()
        .setLabel("Team members")
        .setUserSelectMenuComponent(teamSelect)
    );
  await itr.showModal(modal);
}
