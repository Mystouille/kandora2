import {
  ChatInputCommandInteraction,
  InteractionCallbackResponse,
} from "discord.js";
import {
  invariantLocale,
  NameDesc,
  strings,
} from "../../resources/localization/strings";
import { localize } from "../../utils/localizationUtils";

export const nanikiruOptions = {
  nbRounds: strings.commands.quizz.nanikiru.params.nbRounds,
  mode: strings.commands.quizz.nanikiru.params.mode,
  series: strings.commands.quizz.nanikiru.params.series,
};

export async function executeQuizzNanikiru(
  itr: ChatInputCommandInteraction,
  response: InteractionCallbackResponse<boolean>
) {
  const thread = itr.options.getInteger(
    optionName(nanikiruOptions.nbRounds),
    false
  );
}

function optionName(path: NameDesc) {
  return localize(invariantLocale, path.name);
}
