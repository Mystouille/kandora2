import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import { User } from "../../db/User";
import { localize } from "../../utils/localizationUtils";
import { strings } from "../../resources/localization/strings";

export async function execute(itr: ModalSubmitInteraction) {
  const user = await User.findOne({ discordId: itr.user.id }).exec();

  if (!user) {
    await itr.reply({
      content: localize(
        itr.locale,
        strings.commands.myinfo.delete.reply.userNotFound
      ),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  user.discordId = "anonymous";
  user.name = "anonymous";
  user.riichiCityIdentity = undefined;
  user.majsoulIdentity = undefined;
  user.tenhouIdentity = undefined;
  await user.save();

  await itr.reply({
    content: localize(
      itr.locale,
      strings.commands.myinfo.delete.reply.successMessage
    ),
    flags: MessageFlags.Ephemeral,
  });
}
