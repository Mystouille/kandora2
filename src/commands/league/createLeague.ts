import {
  invariantLocale,
  NameDesc,
  strings,
} from "../../resources/localization/strings";
import {
  ChatInputCommandInteraction,
  InteractionCallbackResponse,
} from "discord.js";
import { localize } from "../../utils/localizationUtils";
import { League, Platform, Ruleset } from "../../db/League";

export const createleagueOptions = {
  leagueName: strings.commands.league.create.params.leagueName,
  startTime: strings.commands.league.create.params.startTime,
  endTime: strings.commands.league.create.params.endTime,
  cutoffTime: strings.commands.league.create.params.cutoffTime,
  ruleset: strings.commands.league.create.params.ruleset,
  platform: strings.commands.league.create.params.platform,
};

function optionName(path: NameDesc) {
  return localize(invariantLocale, path.name);
}

export async function executeCreateleague(
  itr: ChatInputCommandInteraction,
  response: InteractionCallbackResponse<boolean>
) {
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

  const existingleague = await League.findOne({ name: leagueName }).exec();
  if (existingleague !== null) {
    await response.resource?.message?.edit({
      content: "a league with this name already exists",
    });
    return;
  }

  League.create({
    name: leagueName,
    startTime: startDate,
    endTime: endDate ?? undefined,
    finalsCutoffTime: cutoffDate ?? undefined,
    rules: rulesetStr,
    platform: platformStr,
    hasTeams: true,
  }).then(async (newleague) => {
    await response.resource?.message?.edit({
      content: `League \`${newleague.name}\` created successfully!`,
    });
  });
}
