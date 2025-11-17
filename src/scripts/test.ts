import {
  getNewChinitsuProblem,
  SuitOption,
} from "../mahjong/ChinitsuGenerator";

const a = new Date();
const { answer, hand } = getNewChinitsuProblem(SuitOption.Manzu);
const b = new Date();
console.log(hand);
console.log(answer.toString());
console.log((b.getTime() - a.getTime()) / 1_000);
