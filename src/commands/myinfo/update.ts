import {
  ChatInputCommandInteraction,
  LabelBuilder,
  ModalBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { UserModel } from "../../db/User";
import { MahjongSoulConnector } from "../../api/majsoul/data/MajsoulConnector";

export async function executeUpdateMyInfo(
  interaction: ChatInputCommandInteraction
) {
  const user = await UserModel.findOne({
    discordId: interaction.user.id,
  }).exec();

  const msoulConnector = MahjongSoulConnector.instance;
  let mahjongsoulNickname = undefined;
  if (user?.majsoulIdentity?.friendId) {
    mahjongsoulNickname = (
      await msoulConnector.getUserInfoFromFriendId(
        user.majsoulIdentity.friendId
      )
    ).nickname;
    if (mahjongsoulNickname !== undefined) {
      user.majsoulIdentity.name = mahjongsoulNickname;
      await user.save();
    }
  }
  const modal = new ModalBuilder()
    .setCustomId("infoModal")
    .setTitle("Edit my information")
    .addLabelComponents(() =>
      new LabelBuilder().setLabel("Mahjongsoul ID").setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("mahjongsoulId")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setPlaceholder("Your Mahjong Soul friend Id")
          .setValue(user?.majsoulIdentity?.friendId.toString() ?? "")
      )
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "Mahjong Soul name: " +
          (mahjongsoulNickname ??
            user?.majsoulIdentity?.name ??
            "(not fetched)")
      )
    )
    .addLabelComponents(() =>
      new LabelBuilder().setLabel("RiichiCity ID").setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("riichiCityId")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setPlaceholder("Your RiichiCity friend Id")
          .setValue(user?.riichiCityIdentity?.id ?? "")
      )
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "RiichiCity name: " +
          (user?.riichiCityIdentity?.name ?? "(not fetched)")
      )
    )
    .addLabelComponents(() =>
      new LabelBuilder().setLabel("Tenhou ID").setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("tenhouId")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setPlaceholder("Your Tenhou username")
          .setValue(user?.tenhouIdentity?.name ?? "")
      )
    );
  await interaction.showModal(modal);
}
