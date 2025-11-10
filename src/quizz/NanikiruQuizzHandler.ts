import { QuizzGenerator, QuizzHandler } from "./QuizzHandler";

export class NanikiruQuizzHandler extends QuizzHandler {
  public constructor(generator: QuizzGenerator) {
    super(generator, 0, 0);
  }

  public onQuestionEnd(): void {}

  public onQuestionReaction(): void {}

  public onQuestionTimeout(message: string): void {}
}
