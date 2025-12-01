import {
  ChatInputCommandInteraction,
  MessageFlags,
  PublicThreadChannel,
} from "discord.js";
import {
  invariantLocale,
  NameDesc,
  strings,
} from "../../resources/localization/strings";
import { localize } from "../../utils/localizationUtils";
import { QuizMode } from "../quiz/handlers/QuizHandler";
import { NanikiruQuizHandler } from "../quiz/handlers/NanikiruQuizHandler";
import {
  NanikiruCollections,
  NanikiruType,
} from "../../resources/nanikiru/NanikiruCollections";

export const nanikiruOptions = {
  id: strings.commands.admin.checkNanikiru.params.id,
};

export async function executeCheckNanikiru(itr: ChatInputCommandInteraction) {
  const index = itr.options.getInteger(optionName(nanikiruOptions.id), true);

  const problem = await NanikiruCollections.instance.getProblemFromRowId(index);
  if (problem === null) {
    itr.reply({
      content: `No problem found for id ${index}`,
      options: { flags: MessageFlags.Ephemeral },
    });
    return;
  }

  const dummyHandler = new NanikiruQuizHandler(
    null as unknown as PublicThreadChannel, // wont be used so it's ok
    itr,
    QuizMode.Explore,
    0,
    1,
    NanikiruType.Undefined
  );

  const question = await dummyHandler.problemToQuestion(problem);
  itr.user.send({
    content: `text:\n\n${question.questionText}\n\n options:\n\n${question.optionEmojis.join("")}\n\n answer:\n\n${question.fullAnswer}`,
    files: [question.questionImage],
    options: { flags: MessageFlags.Ephemeral },
  });
}

function optionName(path: NameDesc) {
  return localize(invariantLocale, path.name);
}
