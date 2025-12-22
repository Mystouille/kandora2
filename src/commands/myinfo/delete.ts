import {
  ChatInputCommandInteraction,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { User } from "../../db/User";

export async function executeDeleteMyInfo(
  interaction: ChatInputCommandInteraction
) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  });
  const user = await User.findOne({ discordId: interaction.user.id }).exec();

  if (!user) {
    await interaction.editReply({
      content: "User has no data to delete.",
    });
    return;
  }
  const modal = new ModalBuilder()
    .setCustomId("deleteInfoModal")
    .setTitle("Confirm info deletion")
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "### ⚡💀Are you sure you want to delete your information? This action cannot be undone. All your data will be removed from Kandora's database, including your game and tournament history.\nThe recorded games will still be preserved but will contain \`anonymous\` instead of your username."
      )
    )
    .addLabelComponents(() =>
      new LabelBuilder()
        .setLabel(`Enter your discord username:  ${interaction.user.username}`)
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("validationInput")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder("Your discord username")
        )
    );
  await interaction.showModal(modal);
}
