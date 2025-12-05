import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import { User } from "../../db/User";
import { MahjongSoulConnector } from "../../api/majsoul/data/MajsoulConnector";

export async function execute(itr: ModalSubmitInteraction) {
  let user = await User.findOne({ discordId: itr.user.id }).exec();

  if (!user) {
    user = await User.create({
      discordId: itr.user.id,
    });
  }
  const mahjongsoulId = itr.fields.getTextInputValue("mahjongsoulId");
  const riichiCityId = itr.fields.getTextInputValue("riichiCityId");
  const tenhouId = itr.fields.getTextInputValue("tenhouId");
  const msoulConnector = MahjongSoulConnector.instance;
  if (
    mahjongsoulId.length > 0 &&
    !isNaN(Number(mahjongsoulId)) &&
    user?.majsoulIdentity?.friendId !== mahjongsoulId
  ) {
    const { nickname, accountId } =
      await msoulConnector.getUserInfoFromFriendId(mahjongsoulId);
    if (nickname === undefined) {
      await itr.reply({
        content: `Could not find Mahjong Soul user with friend ID ${mahjongsoulId}. Please check your ID and try again.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (!user.majsoulIdentity) {
      user.majsoulIdentity = {
        friendId: mahjongsoulId,
        name: nickname,
        userId: accountId.toString(),
      };
    } else {
      user.majsoulIdentity.friendId = mahjongsoulId;
      user.majsoulIdentity.name = nickname;
      user.majsoulIdentity.userId = accountId.toString();
    }
  }
  if (
    riichiCityId.length > 0 &&
    user?.riichiCityIdentity?.id !== riichiCityId
  ) {
    if (!user.riichiCityIdentity) {
      user.riichiCityIdentity = { id: riichiCityId, name: "" };
    } else {
      user.riichiCityIdentity.id = riichiCityId;
    }
  }
  if (tenhouId.length > 0 && user?.tenhouIdentity?.name !== tenhouId) {
    if (!user.tenhouIdentity) {
      user.tenhouIdentity = { name: tenhouId };
    } else {
      user.tenhouIdentity.name = tenhouId;
    }
  }
  await user.save();
  await itr.reply({
    content: "Your information has been updated.",
    flags: MessageFlags.Ephemeral,
  });
}
