import {
  ChatInputCommandInteraction,
  Locale,
  Message,
  PublicThreadChannel,
} from "discord.js";
import { localize } from "../../utils/localizationUtils";
import { strings } from "../../resources/localization/strings";
import { stringFormat } from "../../utils/stringUtils";
import { AppEmojiName } from "../../resources/emojis/AppEmojiCollection";
import { config } from "../../config";

export type QuizzQuestion = {
  questionImage: string;
  optionEmojis: string[];
  answer: string[];
  fullAnswer: string | undefined;
};

export enum ChangeType {
  Collect = "collect",
  Remove = "remove",
}

export enum QuizzMode {
  Explore = "Explore",
  First = "First",
  Race = "Race",
}

enum StopReason {
  Winner = "winner",
  Time = "time",
  Reveal = "reveal",
}

const commonStrings = strings.commands.quizz.common.reply;

export abstract class QuizzHandler {
  protected startTime: Date;

  protected winnerTimings: { [id: string]: number };
  protected loserTimings: { [id: string]: number };
  protected playerPoints: { [id: string]: number };
  protected abstract getNewQuestionData(): Promise<QuizzQuestion>;
  protected abstract get baseMessagePath(): string;
  protected abstract get firstThreadMessage(): string;
  protected currentQuestion: QuizzQuestion;

  protected usersAnswers: { [id: string]: string[] };
  protected rewardTable: number[];

  protected nbQuestionsAsked: number;

  protected constructor(
    protected thread: PublicThreadChannel<false>,
    protected interaction: ChatInputCommandInteraction,
    protected quizzMode: QuizzMode,
    protected timeout: number,
    protected nbTotalQuestion: number
  ) {
    this.nbQuestionsAsked = 0;
    this.currentQuestion = {
      answer: [],
      fullAnswer: "",
      optionEmojis: [],
      questionImage: "",
    };
    this.startTime = new Date();
    this.winnerTimings = {};
    this.loserTimings = {};
    this.playerPoints = {};
    this.usersAnswers = {};
    this.rewardTable = [6, 4, 2, 1, 1];
  }

  protected get locale() {
    return this.interaction.locale;
  }

  protected sortTimings(timings: { [id: string]: number }) {
    const list: { player: string; timing: number }[] = [];
    Object.keys(timings).forEach((key) =>
      list.push({ player: key, timing: timings[key] })
    );
    return list.sort((a, b) => a.timing - b.timing);
  }

  private async generateNextQuestion() {
    this.currentQuestion = await this.getNewQuestionData();
    this.nbQuestionsAsked++;
  }

  protected changeUserAnswer(
    userId: string,
    answer: string,
    changeType: ChangeType
  ): boolean {
    if (changeType === ChangeType?.Collect) {
      if (!this.usersAnswers[userId]) {
        this.usersAnswers[userId] = [];
      }
      this.usersAnswers[userId].push(answer);
    } else {
      this.usersAnswers[userId]?.filter((x) => x !== answer);
    }
    const correctUserAnswers = this.usersAnswers[userId]?.filter(
      (x) => this.currentQuestion.answer.findIndex((y) => y === x) >= 0
    );
    const isWinner =
      correctUserAnswers.length == this.usersAnswers[userId].length &&
      correctUserAnswers.length === this.currentQuestion.answer.length;
    const endTime = new Date();
    const durationMs = endTime.getTime() - this.startTime.getTime();
    if (isWinner) {
      this.winnerTimings[userId] = durationMs;
    } else {
      this.loserTimings[userId] = durationMs;
    }
    return isWinner;
  }

  protected getCurrentWinners() {
    if (this.timeout === 0) {
      return "";
    }
    const sb = [];
    const timingList = Object.entries(this.winnerTimings)
      .map(([player, timing]) => ({ player, timing }))
      .sort((a, b) => b.timing - a.timing);
    for (let i = 0; i < this.rewardTable.length; i++) {
      if (i < timingList.length) {
        sb.push(
          `${i + 1}: <@${timingList[i].player}>\`+${this.rewardTable[i]}pts\` (${Math.round(timingList[i].timing / 1000).toFixed(1)}s)`
        );
      } else {
        sb.push(`${i + 1}: ....`);
      }
    }
    return sb.join("\n");
  }

  protected addPointsToUser(userId: string, points: number) {
    this.playerPoints[userId] = (this.playerPoints[userId] || 0) + points;
  }

  protected updateScores() {
    const timingList = Object.entries(this.winnerTimings)
      .map(([player, timing]) => ({ player, timing }))
      .sort((a, b) => b.timing - a.timing);
    if (this.timeout === 0) {
      if (timingList.length > 0) {
        this.addPointsToUser(timingList[0].player, 1);
      }
    } else {
      for (let i = 0; i < this.rewardTable.length; i++) {
        this.addPointsToUser(timingList[i].player, this.rewardTable[i]);
      }
    }
  }

  public startQuizz() {
    this.postNewQuestion();
  }

  protected async postNewQuestion(): Promise<Message<true> | undefined> {
    await this.generateNextQuestion();
    const question = this.currentQuestion;
    let sb = [];
    sb.push(".");
    sb.push(this.getFullOpeningMessage(this.locale, this.baseMessagePath));
    const questionText = sb.join("\n");

    sb = [];
    sb.push(".");
    sb.push(localize(this.locale, commonStrings.problemIsLoading));
    const waitText = sb.join("\n");
    const image = this.currentQuestion.questionImage;
    const message = await this.thread.send({
      content: waitText,
    });
    question.optionEmojis.forEach(async (option) => {
      message.react(option);
    });
    if (this.quizzMode === QuizzMode.Explore) {
      message.react(AppEmojiName.Eyes);
    }
    const collector = message.createReactionCollector({
      dispose: true,
      time: this.timeout > 0 ? this.timeout * 1_000 : undefined,
    });
    console.log(`collector ${message.id} started`);
    collector.on("end", (_, reason: StopReason) => {
      console.log(`collector ${message.id} ended`);
      this.onQuestionEnd(message, reason);
    });
    collector.on(ChangeType.Collect, (reaction, user) => {
      if (
        user.id !== config.DISCORD_CLIENT_ID &&
        reaction.emoji.name !== null
      ) {
        if (
          this.quizzMode === QuizzMode.Explore &&
          reaction.emoji.name === AppEmojiName.Eyes
        ) {
          collector.stop(StopReason.Reveal);
          return;
        }
        const isOk = this.changeUserAnswer(
          user.id,
          reaction.emoji.name,
          ChangeType.Collect
        );
        if (isOk && this.quizzMode == QuizzMode.First) {
          collector.stop(StopReason.Winner);
        }
      }
    });
    collector.on(ChangeType.Remove, (reaction, user) => {
      if (reaction.emoji.name !== null) {
        const isOk = this.changeUserAnswer(
          user.id,
          reaction.emoji.name,
          ChangeType.Remove
        );
        if (isOk && this.quizzMode == QuizzMode.First) {
          collector.stop(StopReason.Winner);
        }
      }
    });
    message.edit({ content: questionText, files: [image] });
    return message;
  }

  private onQuestionEnd(message: Message<true>, reason: StopReason) {
    const sb = [];
    sb.push(localize(this.locale, commonStrings.roundOver));
    sb.push(this.getFullOpeningMessage(this.locale, this.baseMessagePath));
    message.edit({ content: sb.join("\n") });
    message.reactions.removeAll();
    this.replyWithAnswer(message, reason);
    if (this.nbQuestionsAsked < this.nbTotalQuestion) {
      this.postNewQuestion();
    }
  }

  private replyWithAnswer(message: Message<true>, reason: StopReason) {
    const sb = [];
    if (
      reason === StopReason.Time &&
      Object.keys(this.winnerTimings).length === 0
    ) {
      sb.push(localize(this.locale, commonStrings.timeoutNoWinnerReply));
    }
    if (
      Object.keys(this.winnerTimings).length > 0 ||
      Object.keys(this.loserTimings).length > 0
    ) {
      sb.push(".");
    }
    if (Object.keys(this.winnerTimings).length > 0) {
      const winners = this.sortTimings(this.winnerTimings)
        .map((w) => `<@${w.player}>`)
        .join("");
      sb.push(stringFormat(this.locale, commonStrings.winnerFormat, winners));
    }
    if (Object.keys(this.loserTimings).length > 0) {
      const losers = this.sortTimings(this.loserTimings)
        .map((l) => `<@${l.player}>`)
        .join("");
      sb.push(stringFormat(this.locale, commonStrings.loserFormat, losers));
    }

    sb.push(this.currentQuestion?.fullAnswer);
    message.reply({ content: sb.join("\n") });
  }

  protected getFullOpeningMessage(locale: Locale, baseMessagePath: string) {
    const openingMessage = localize(locale, baseMessagePath);
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
      case QuizzMode.Race:
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
}
