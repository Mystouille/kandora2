import {
  invariantLocale,
  NameDesc,
  strings,
} from "../../resources/localization/strings";
import { ChatInputCommandInteraction } from "discord.js";
import { localize } from "../../utils/localizationUtils";
import { League, Platform, Ruleset } from "../../db/League";

export const createleagueOptions = {
  leagueName: strings.commands.league.createLeague.params.leagueName,
  startTime: strings.commands.league.createLeague.params.startTime,
  endTime: strings.commands.league.createLeague.params.endTime,
  cutoffTime: strings.commands.league.createLeague.params.cutoffTime,
  ruleset: strings.commands.league.createLeague.params.ruleset,
  platform: strings.commands.league.createLeague.params.platform,
  adminChannel: strings.commands.league.createLeague.params.adminChannel,
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

  const existingleague = await League.findOne({ name: leagueName }).exec();
  if (existingleague !== null) {
    await itr.editReply({
      content: "a league with this name already exists",
    });
    return;
  }

  const sb: string[] = [];

  const ongoingleague = await League.findOne({ isOngoing: true }).exec();
  if (ongoingleague !== null) {
    await League.updateOne(
      { _id: ongoingleague._id },
      { isOngoing: false }
    ).exec();
    sb.push(`terminated the ongoing league: \`${ongoingleague.name}\``);
    await itr.editReply({
      content: sb.join("\n"),
    });
  }

  League.create({
    name: leagueName,
    startTime: startDate,
    endTime: endDate ?? undefined,
    finalsCutoffTime: cutoffDate ?? undefined,
    rules: rulesetStr,
    platform: platformStr,
    hasTeams: true,
    isOngoing: true,
    adminChannel: adminChannel.id,
  }).then(async (newleague) => {
    sb.push(`League \`${newleague.name}\` created successfully!`);
    await itr.editReply({
      content: sb.join("\n"),
    });
  });
}
