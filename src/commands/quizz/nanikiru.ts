import {
  ChannelType,
  ChatInputCommandInteraction,
  InteractionCallbackResponse,
  ThreadAutoArchiveDuration,
} from "discord.js";
import {
  invariantLocale,
  NameDesc,
  strings,
} from "../../resources/localization/strings";
import { localize } from "../../utils/localizationUtils";
import { QuizzMode } from "./QuizzHandler";
import { NanikiruType } from "../../resources/nanikiru/NanikiruCollections";
import { NanikiruQuizzHandler } from "./NanikiruQuizzHandler";
import { stringFormat } from "../../utils/stringUtils";

export const nanikiruOptions = {
  nbrounds: strings.commands.quizz.nanikiru.params.nbrounds,
  mode: strings.commands.quizz.nanikiru.params.mode,
  series: strings.commands.quizz.nanikiru.params.series,
};

export async function executeQuizzNanikiru(
  itr: ChatInputCommandInteraction,
  response: InteractionCallbackResponse<boolean>
) {
  const nbRoundsParam = itr.options.getInteger(
    optionName(nanikiruOptions.nbrounds),
    false
  );
  const modeParam = itr.options.getString(
    optionName(nanikiruOptions.mode),
    false
  );
  const seriesParam = itr.options.getString(
    optionName(nanikiruOptions.series),
    false
  );
  if (itr.channel?.type === ChannelType.GuildText) {
    const threadManager = itr.channel.threads;
    const mode = modeParam === null ? QuizzMode.Explore : modeParam;
    const series = seriesParam === null ? NanikiruType.Uzaku301 : seriesParam;
    const nbRounds = nbRoundsParam === null ? 1 : nbRoundsParam;

    const currentDate = new Date().toLocaleDateString(itr.locale, {
      month: "narrow",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    itr
      .editReply({
        content: "bla",
      })
      .then(() => {
        threadManager.create({
          name: stringFormat(
            itr.locale,
            strings.commands.quizz.nanikiru.reply.theadNameFormat,
            currentDate,
            nbRounds.toString()
          ),
          autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
          startMessage: response.resource?.message?.id,
          type: 11,
        });
      });
  } else {
    itr.editReply({ content: "cant create a thread here!" });
  }
  const quizzHandler = new NanikiruQuizzHandler();
}

function optionName(path: NameDesc) {
  return localize(invariantLocale, path.name);
}
