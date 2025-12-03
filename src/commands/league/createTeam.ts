import {
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  ContainerBuilder,
  LabelComponent,
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
import { Team } from "../../db/Team";

export const data = new SlashCommandBuilder()
  .setDescription(invariantResources.commands.createuser.desc)
  .setName(invariantResources.commands.createuser.name)
  .setNameLocalizations(getLocProps(strings.commands.createuser.name))
  .setDescriptionLocalizations(getLocProps(strings.commands.createuser.desc));

export async function executeCreateTeam(itr: ChatInputCommandInteraction) {
  //const doc = new User({ name: "bla" });
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
    .setRequired(true);
  const container = new ModalBuilder()
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent("Please select the team captain and members:")
    )
    .addLabelComponents((actionRow) =>
      new LabelComponent().
    )
    .addActionRowComponents((actionRow) =>
      actionRow.setComponents(captainSelect)
    )
    .addActionRowComponents((actionRow) => actionRow.setComponents(teamSelect))
    .addActionRowComponents((actionRow) =>
      actionRow.setComponents(
        new ButtonBuilder()
          .setCustomId("submit")
          .setLabel("Submit")
          .setStyle(ButtonStyle.Primary)
      )
    );

  const responseMessage = await itr.editReply({
    components: [container],
    flags: MessageFlags.Ephemeral + MessageFlags.IsComponentsV2,
  });

  const userSelectCollector = responseMessage.createMessageComponentCollector({
    time: 3_600_000, // 1 hour
    componentType: ComponentType.UserSelect,
  });

  const finalizeCollector = responseMessage.createMessageComponentCollector({
    time: 3_600_000, // 1 hour
    componentType: ComponentType.Button,
  });
  let captainChoice: string | undefined = undefined;
  let teamChoices: string[] = [];
  userSelectCollector.on("collect", async (i) => {
    if (i.customId === "captain") {
      captainChoice = i.values[0];
      console.log(
        `${i.user} has selected ${captainChoice} as the team captain!`
      );
      await i.update({});
      return;
    }
    if (i.customId === "teamMembers") {
      teamChoices = i.values;
      console.log(`${i.user} has selected ${teamChoices} as the team members!`);
      await i.update({});
      return;
    }
  });
  finalizeCollector.on("collect", async (i) => {
    if (i.customId === "submit") {
      Team.create({
        captainId: captainChoice!,
        memberIds: teamChoices,
        captain,
      });
      await i.update({
        components: [
          new ContainerBuilder()
            .setAccentColor(0x00ff00)
            .addTextDisplayComponents((textDisplay) =>
              textDisplay.setContent(
                `Team submitted!\nCaptain: <@${captainChoice}>\nMembers: ${teamChoices.map((id) => `<@${id}>`).join(", ") || "None"}`
              )
            ),
        ],
      });
    }
  });
}
