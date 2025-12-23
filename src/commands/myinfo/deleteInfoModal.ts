import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import { User } from "../../db/User";

export async function execute(itr: ModalSubmitInteraction) {
  const user = await User.findOne({ discordId: itr.user.id }).exec();

  if (!user) {
    await itr.reply({
      content: "User not found.",
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
    content:
      "Your information has been deleted. Everything that is linked to your identity is gone, eventhough some anonymous game data may remain.",
    flags: MessageFlags.Ephemeral,
  });
}
