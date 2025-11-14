import { ChatInputCommandInteraction, PublicThreadChannel } from "discord.js";
import { QuizzHandler, QuizzMode, QuizzQuestion } from "./QuizzHandler";
import { strings } from "../../resources/localization/strings";
import { stringFormat } from "../../utils/stringUtils";
import {
  compareTiles,
  fromStrToHandToDisplay,
  getHandEmojis,
  splitTiles,
  SUIT_NAMES,
} from "../../mahjong/handParser";
import {
  NanikiruCollections,
  NanikiruProblem,
  NanikiruType,
} from "../../resources/nanikiru/NanikiruCollections";
import { AppEmojiName } from "../../resources/emojis/AppEmojiCollection";
import { getImageFromTiles } from "../../mahjong/imageUtils";

const nanikiruStrings = strings.commands.quizz.nanikiru;

export class NanikiruQuizzHandler extends QuizzHandler {
  public constructor(
    thread: PublicThreadChannel<false>,
    interaction: ChatInputCommandInteraction,
    quizzMode: QuizzMode,
    timeout: number | undefined,
    nbQuestion: number | undefined,
    public series: NanikiruType
  ) {
    super(thread, interaction, quizzMode, timeout || 0, nbQuestion || 1);
  }

  protected get firstThreadMessage() {
    return stringFormat(
      this.locale,
      nanikiruStrings.reply.threadFirstMessageFormat
    );
  }

  protected get baseMessagePath() {
    return nanikiruStrings.reply.openingMessage;
  }

  async getNewQuestionData() {
    const problem = NanikiruCollections.instance.getNextProblem(this.series);
    return this.problemToQuestion(problem);
  }

  protected async problemToQuestion(
    problem: NanikiruProblem
  ): Promise<QuizzQuestion> {
    const fullAnswer = this.getAnswerTextFromProblem(problem);
    const answer = splitTiles(
      problem.answer.replaceAll("k", "").replaceAll("r", "")
    );
    answer.sort(compareTiles);

    const questionImage = await getImageFromTiles(
      fromStrToHandToDisplay(problem.hand)
    );

    if (problem.answer.includes("k")) {
      answer.push(AppEmojiName.Kan);
    }
    if (problem.answer.includes("r")) {
      answer.push(AppEmojiName.Riichi);
    }

    const optionEmojis = getHandEmojis({
      hand: problem.hand,
      sorted: true,
      unique: true,
    });
    return { questionImage, answer, fullAnswer, optionEmojis };
  }

  protected getAnswerTextFromProblem(problem: NanikiruProblem) {
    const sb = [];
    const answerEmojis = getHandEmojis({
      hand: problem.answer,
    });
    sb.push(`# ${nanikiruStrings.reply.answerLabel} ||${answerEmojis}||`);

    if (problem.ukeire.startsWith("#")) {
      sb.push(this.formatAnswerText(problem.ukeire));
    }
    if (problem.explanation) {
      sb.push(this.formatAnswerText(problem.explanation, "###", true));
    }
    sb.push("### " + problem.source);
    return sb.join("\n");
  }

  formatAnswerText(
    textRaw: string,
    prefix: string = "",
    spoiler: boolean = true
  ) {
    const compositeText = textRaw.split("#");

    for (let i = 0; i < compositeText.length; i++) {
      if ((i + 2) % 3 === 0) {
        const handText = compositeText[i].split("+");
        const emojiHand: string[] = [];
        handText.forEach((subHand) =>
          emojiHand.push(
            getHandEmojis({ hand: subHand, sorted: false, unique: false }).join(
              ""
            )
          )
        );
        compositeText[i] = "# " + emojiHand.join("➕");
      } else {
        let textWithEmojis = compositeText[i];
        for (let n = 0; n <= 9; n++) {
          SUIT_NAMES.forEach((s: string) => {
            if (s === "z" && (n > 7 || n === 0)) {
              return;
            }
            const emojiStr = n.toString() + s;
            textWithEmojis = textWithEmojis.replaceAll(
              emojiStr,
              getHandEmojis({ hand: emojiStr }).join("")
            );
          });
        }
        compositeText[i] =
          (textWithEmojis.length > 0 ? prefix : "") + textWithEmojis;
      }
    }
    let finalText = compositeText.join("\n");
    if (spoiler) {
      finalText = `||${finalText}||`;
    }
    return finalText;
  }
}
