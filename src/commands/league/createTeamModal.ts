import { ModalSubmitInteraction } from "discord.js";
import { Team } from "../../db/Team";
import { League } from "../../db/League";

export async function execute(itr: ModalSubmitInteraction) {
  const teamName = itr.fields.getTextInputValue("teamName");
  const fancyTeamName = itr.fields.getTextInputValue("fancyTeamName");
  const captainChoice = itr.fields.getSelectedUsers("captain")?.first()?.id;
  const teamChoices =
    itr.fields.getSelectedUsers("teamMembers")?.map((user) => user.id) || [];
  const league = await League.findOne({ isOngoing: true }).exec();

  if (league === null) {
    await itr.editReply({
      content: "There is no ongoing league to register a team for.",
    });
    return;
  }

  await Team.create({
    simpleName: teamName,
    displayName: fancyTeamName,
    captain: captainChoice!,
    members: teamChoices,
    leagueId: league?._id,
  });
  itr.editReply(
    `Team submitted!\nTeam name:${teamName}\nteam display name:${fancyTeamName}\nCaptain: <@${captainChoice}>\nMembers: ${teamChoices.map((id) => `<@${id}>`).join(", ") || "None"}`
  );
}
