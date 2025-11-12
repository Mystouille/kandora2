import {
  ChatInputCommandInteraction,
  Locale,
  Message,
  messageLink,
  PublicThreadChannel,
} from "discord.js";
import {
  QuizzGenerator,
  QuizzHandler,
  QuizzMode,
} from "../../quizz/QuizzHandler";
import { localize } from "../../utils/localizationUtils";
import { strings } from "../../resources/localization/strings";
import { stringFormat } from "../../utils/stringUtils";
import { getHandEmojis } from "../../mahjong/handParser";

const commonStrings = strings.commands.quizz.common.reply;
const nanikiruStrings = strings.commands.quizz.nanikiru;

export class NanikiruQuizzHandler extends QuizzHandler {
  public constructor(
    public thread: PublicThreadChannel<false>,
    generator: QuizzGenerator,
    quizzMode: QuizzMode,
    timeout: number | undefined,
    nbQuestion: number | undefined
  ) {
    super(generator, quizzMode, timeout || 0, nbQuestion || 1);
  }

  public onQuestionEnd(): void {}

  public onQuestionReaction(): void {}

  public onQuestionTimeout(message: string): void {
    this.updateScores();
  }

  getOpeningMessage(locale: Locale) {
    const openingMessage = localize(
      locale,
      strings.commands.quizz.nanikiru.reply.openingMessage
    );
    switch (this.quizzMode) {
      case QuizzMode.Explore:
        return stringFormat(
          locale,
          commonStrings.openingMessageExploreFormat,
          `${this.nbQuestionsAsked}`,
          `${this.nbTotalQuestion}`,
          openingMessage
        );
      case QuizzMode.First:
        return stringFormat(
          locale,
          commonStrings.openingMessageFirstFormat,
          `${this.nbQuestionsAsked}`,
          `${this.nbTotalQuestion}`,
          openingMessage
        );
      case QuizzMode.Explore:
        return stringFormat(
          locale,
          commonStrings.openingMessageRaceFormat,
          `${this.nbQuestionsAsked}`,
          `${this.nbTotalQuestion}`,
          `${this.timeout}`,
          openingMessage
        );
    }
  }

  protected getAnswer(locale: Locale) {
    const sb = [];
    const answerEmojis = getHandEmojis({
      hand: this.currentQuestion.answer.join(""),
    });
    sb.push(`# ${nanikiruStrings.reply.answerLabel} ||${answerEmojis}||`);

    if (Object.keys(this.winnerTimings).length > 0) {
      const winners = this.sortTimings(this.winnerTimings)
        .map((w) => `<@${w.player}>`)
        .join("");
      sb.push(stringFormat(locale, commonStrings.winnerFormat, winners));
    }
    if (Object.keys(this.loserTimings).length > 0) {
      const losers = this.sortTimings(this.loserTimings)
        .map((l) => `<@${l.player}>`)
        .join("");
      sb.push(stringFormat(locale, commonStrings.loserFormat, losers));
    }

    // TODO: here!
    const losers = this.sortTimings(this.loserTimings).map(
      (l) => `<@${l.player}>`
    );
    return sb.join("\n");
  }

  protected postAnswer(
    itr: ChatInputCommandInteraction,
    message: Message<boolean>
  ) {
    const sb = [];
    sb.push(localize(itr.locale, commonStrings.roundOver));
    sb.push(this.getOpeningMessage(itr.locale));
    message.edit({ content: sb.join("\n") });
    message.reactions.removeAll();

    const answer = this.getAnswer(itr.locale);
    message.reply({ content: answer });
  }
}
