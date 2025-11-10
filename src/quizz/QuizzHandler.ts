export type QuizzQuestion = {
  explanation: string | undefined;
  questionImage: string;
  optionEmojis: string[];
  answer: string[];
};

export type QuizzGenerator = {
  getNextQuestion(): QuizzQuestion;
};

export enum ChangeType {
  Add = "Add",
  Remove = "Remove",
}

export abstract class QuizzHandler {
  public startTime: Date;
  public resetTimer = () => {
    this.startTime = new Date();
  };

  public winnerTimings: { [id: string]: number };
  public loserTimings: { [id: string]: number };
  public playerPoints: { [id: string]: number };
  public abstract onQuestionEnd(): void;
  public abstract onQuestionTimeout(message: string): void;
  public usersAnswers: { [id: string]: string[] };
  public rewardTable: number[];

  public currentQuestion: QuizzQuestion;

  protected constructor(
    public generator: QuizzGenerator,
    public timeout: number,
    public nbTotalQuestion: number
  ) {
    this.currentQuestion = generator.getNextQuestion();
    this.startTime = new Date();
    this.winnerTimings = {};
    this.loserTimings = {};
    this.playerPoints = {};
    this.usersAnswers = {};
    this.rewardTable = [6, 4, 2, 1, 1];
  }

  public changeUserAnswer(
    userId: string,
    answer: string,
    changeType: ChangeType
  ): boolean {
    if (changeType === ChangeType?.Add) {
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

  public getCurrentWinners() {
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

  public addPointsToUser(userId: string, points: number) {
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
}
