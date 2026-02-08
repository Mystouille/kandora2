import {
  invariantLocale,
  NameDesc,
  strings,
} from "../../resources/localization/strings";
import { ChatInputCommandInteraction } from "discord.js";
import { localize } from "../../utils/localizationUtils";
import { LeagueModel, Platform, Ruleset } from "../../db/League";
import { LeagueService } from "../../services/LeagueService";
import { leagueData } from "../../resources/leagueData/lfcr";
import { UserModel } from "../../db/User";
import { TeamModel } from "../../db/Team";
import { MahjongSoulConnector } from "../../api/majsoul/data/MajsoulConnector";
import mongoose from "mongoose";

export const createleagueOptions = {
  leagueName: strings.commands.league.createLeague.params.leagueName,
  startTime: strings.commands.league.createLeague.params.startTime,
  endTime: strings.commands.league.createLeague.params.endTime,
  cutoffTime: strings.commands.league.createLeague.params.cutoffTime,
  ruleset: strings.commands.league.createLeague.params.ruleset,
  platform: strings.commands.league.createLeague.params.platform,
  adminChannel: strings.commands.league.createLeague.params.adminChannel,
  gameChannel: strings.commands.league.createLeague.params.gameChannel,
  rankingChannel: strings.commands.league.createLeague.params.rankingChannel,
  tournamentId: strings.commands.league.createLeague.params.tournamentId,
};

function optionName(path: NameDesc) {
  return localize(invariantLocale, path.name);
}

export async function executeCreateLeague(itr: ChatInputCommandInteraction) {
  const leagueName = itr.options.getString(
    optionName(createleagueOptions.leagueName),
    true
  );
  const startTimeStr = itr.options.getString(
    optionName(createleagueOptions.startTime),
    true
  );
  const startDate = new Date(startTimeStr);

  const endTimeStr = itr.options.getString(
    optionName(createleagueOptions.endTime),
    false
  );
  const endDate = endTimeStr ? new Date(endTimeStr) : undefined;
  const cutoffTimeStr = itr.options.getString(
    optionName(createleagueOptions.cutoffTime),
    false
  );
  const cutoffDate = cutoffTimeStr ? new Date(cutoffTimeStr) : undefined;
  const rulesetStr = itr.options.getString(
    optionName(createleagueOptions.ruleset),
    true
  ) as Ruleset;
  const platformStr = itr.options.getString(
    optionName(createleagueOptions.platform),
    true
  ) as Platform;

  const adminChannel = itr.options.getChannel(
    optionName(createleagueOptions.adminChannel),
    true
  );

  const gameChannel = itr.options.getChannel(
    optionName(createleagueOptions.gameChannel),
    true
  );

  const rankingChannel = itr.options.getChannel(
    optionName(createleagueOptions.rankingChannel),
    true
  );

  const tournamentId = itr.options.getString(
    optionName(createleagueOptions.tournamentId),
    false
  );

  const existingleague = await LeagueModel.findOne({ name: leagueName }).exec();
  if (existingleague !== null) {
    await itr.editReply({
      content: "a league with this name already exists",
    });
    return;
  }

  const sb: string[] = [];

  const ongoingleague = await LeagueModel.findOne({ isOngoing: true }).exec();
  if (ongoingleague !== null) {
    await LeagueModel.updateOne(
      { _id: ongoingleague._id },
      { isOngoing: false }
    ).exec();
    sb.push(`terminated the ongoing league: \`${ongoingleague.name}\``);
    await itr.editReply({
      content: sb.join("\n"),
    });
  }
  const league = new LeagueModel({
    name: leagueName,
    startTime: startDate,
    endTime: endDate ?? undefined,
    finalsCutoffTime: cutoffDate ?? undefined,
    rules: rulesetStr,
    platform: platformStr,
    hasTeams: true,
    isOngoing: true,
    adminChannel: adminChannel.id,
    gameChannel: gameChannel.id,
    rankingChannel: rankingChannel.id,
    tournamentId: tournamentId ?? undefined,
  });

  league.save().then(async (newLeague) => {
    const msoulConnector = MahjongSoulConnector.instance;
    const teamCache = new Map<string, mongoose.Types.ObjectId>();

    for (const player of leagueData) {
      if (player.team === "") {
        sb.push(
          `Player ${player.nickname} does not have a team and was not added to the league.`
        );
        continue;
      }
      // Look up Majsoul user info
      const majsoulInfo = await msoulConnector.getUserInfoFromFriendId(
        player.id
      );

      // Create or update user
      let user = await UserModel.findOne({
        "majsoulIdentity.friendId": player.id,
      }).exec();

      if (!user) {
        user = await UserModel.create({
          name: player.nickname,
          majsoulIdentity: {
            friendId: player.id,
            userId: majsoulInfo.accountId?.toString(),
            name: majsoulInfo.nickname ?? player.nickname,
          },
        });
        console.log("added new user:", user.name);
      }

      // Get or create team
      let teamId = teamCache.get(player.team);
      if (!teamId) {
        let team = await TeamModel.findOne({
          simpleName: player.team,
          leagueId: newLeague._id,
        }).exec();

        if (!team) {
          team = await TeamModel.create({
            simpleName: player.team,
            displayName: player.team,
            leagueId: newLeague._id,
            captain: user._id,
            members: [user._id],
          });
        }
        teamId = team._id;
        teamCache.set(player.team, teamId);
      } else {
        // Add user to existing team
        await TeamModel.updateOne(
          { _id: teamId },
          { $addToSet: { members: user._id } }
        ).exec();
      }
    }

    sb.push(`Added ${leagueData.length} players to ${teamCache.size} teams.`);
    sb.push(`League \`${newLeague.name}\` created successfully!`);
    await itr.editReply({
      content: sb.join("\n"),
    });
    await LeagueService.instance.InitLeague(itr.client, newLeague);
  });
}
