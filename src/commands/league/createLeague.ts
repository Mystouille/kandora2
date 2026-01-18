import {
  invariantLocale,
  NameDesc,
  strings,
} from "../../resources/localization/strings";
import { ChatInputCommandInteraction } from "discord.js";
import { localize } from "../../utils/localizationUtils";
import { League, LeagueModel, Platform, Ruleset } from "../../db/League";
import { LeagueService } from "../../services/LeagueService";

export const createleagueOptions = {
  leagueName: strings.commands.league.createLeague.params.leagueName,
  startTime: strings.commands.league.createLeague.params.startTime,
  endTime: strings.commands.league.createLeague.params.endTime,
  cutoffTime: strings.commands.league.createLeague.params.cutoffTime,
  ruleset: strings.commands.league.createLeague.params.ruleset,
  platform: strings.commands.league.createLeague.params.platform,
  adminChannel: strings.commands.league.createLeague.params.adminChannel,
  gameChannel: strings.commands.league.createLeague.params.gameChannel,
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
  const league: League = {
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
    tournamentId: tournamentId ?? undefined,
  };

  await LeagueModel.create(league).then(async (newLeague) => {
    sb.push(`League \`${newLeague.name}\` created successfully!`);
    await itr.editReply({
      content: sb.join("\n"),
    });
    LeagueService.instance.InitLeague(itr.client, newLeague);
  });
}
