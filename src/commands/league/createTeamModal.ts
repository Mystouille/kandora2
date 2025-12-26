import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import { TeamModel } from "../../db/Team";
import { LeagueModel } from "../../db/League";
import { UserModel } from "../../db/User";

export async function execute(itr: ModalSubmitInteraction) {
  const teamName = itr.fields.getTextInputValue("teamName");
  const fancyTeamName = itr.fields.getTextInputValue("fancyTeamName");
  const captainChoice = itr.fields.getSelectedUsers("captain")?.first()?.id;
  const teamChoices =
    itr.fields.getSelectedUsers("teamMembers")?.map((user) => user.id) || [];
  const league = await LeagueModel.findOne({ isOngoing: true }).exec();

  if (league === null) {
    await itr.reply({
      content: "There is no ongoing league to register a team for.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  let captainUser = await UserModel.findOne({
    discordId: captainChoice,
  }).exec();
  if (captainUser === null) {
    captainUser = await UserModel.create({ discordId: captainChoice! });
  }

  const membersUsers = [];
  for (const memberId of teamChoices) {
    let memberUser = await UserModel.findOne({ discordId: memberId }).exec();
    if (memberUser === null) {
      memberUser = await UserModel.create({ discordId: memberId });
    }
    membersUsers.push(memberUser);
  }

  await TeamModel.create({
    simpleName: teamName,
    displayName: fancyTeamName,
    captain: captainUser._id,
    members: membersUsers.map((user) => user._id),
    leagueId: league?._id,
  });
  itr.reply({
    content: `Team submitted!\nTeam name:${teamName}\nteam display name:${fancyTeamName}\nCaptain: <@${captainChoice}>\nMembers: ${teamChoices.map((id) => `<@${id}>`).join(", ") || "None"}`,
    flags: MessageFlags.Ephemeral,
  });
}
