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
  timeout: strings.commands.quizz.nanikiru.params.timeout,
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
  const timeoutParam = itr.options.getInteger(
    optionName(nanikiruOptions.timeout),
    false
  );
  if (itr.channel?.type === ChannelType.GuildText) {
    const threadManager = itr.channel.threads;
    const mode =
      modeParam === null ? QuizzMode.Explore : (modeParam as QuizzMode);
    const series =
      seriesParam === null
        ? NanikiruType.Uzaku301
        : (seriesParam as NanikiruType);
    const nbRounds = nbRoundsParam === null ? 1 : nbRoundsParam;
    const timeout =
      timeoutParam === null
        ? mode === QuizzMode.Explore
          ? 0
          : 30
        : timeoutParam;

    const currentDate = new Date().toLocaleDateString(itr.locale, {
      month: "narrow",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const timerDisclaimer =
      timeout > 0
        ? stringFormat(
            itr.locale,
            strings.commands.quizz.common.reply.timerDisclaimerFormat,
            timeout.toString()
          )
        : "";
    const startDisclaimer = stringFormat(
      itr.locale,
      strings.commands.quizz.nanikiru.reply.threadFirstMessageFormat,
      nbRounds.toString()
    );
    itr
      .editReply({
        content: `${startDisclaimer} ${timerDisclaimer}`,
      })
      .then(() => {
        threadManager
          .create({
            name: stringFormat(
              itr.locale,
              strings.commands.quizz.nanikiru.reply.theadNameFormat,
              currentDate,
              nbRounds.toString()
            ),
            autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
            startMessage: response.resource?.message?.id,
            type: 11,
          })
          .then((thread) => {
            if (thread.type === ChannelType.PublicThread) {
              const quizzHandler = new NanikiruQuizzHandler(
                thread,
                itr,
                mode,
                timeout,
                nbRounds,
                series
              );
              quizzHandler.startQuizz();
            }
          });
      });
  } else {
    itr.editReply({ content: "cant create a thread here!" });
  }
}

function optionName(path: NameDesc) {
  return localize(invariantLocale, path.name);
}
