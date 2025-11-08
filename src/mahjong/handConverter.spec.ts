import {
  from34To136,
  fromStrToTile34,
  fromStrToTile9997,
} from "./handConverter";

describe("handConverter", () => {
  it("fromStrToTile997", () => {
    let handStr = "123456789m12344p";
    expect(fromStrToTile9997(handStr)).toStrictEqual([
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ]);
    handStr = "123456789s12344z";
    expect(fromStrToTile9997(handStr)).toStrictEqual([
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 2, 0, 0, 0],
    ]);
  });
  it("fromStrToTile34", () => {
    let handStr = "123456789m12344p";
    expect(fromStrToTile34(handStr)).toStrictEqual([
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    handStr = "123456789s12344z";
    expect(fromStrToTile34(handStr)).toStrictEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 2, 0, 0, 0,
    ]);
  });
  it("from34To136", () => {
    let hand34 = [
      3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    expect(from34To136(hand34)).toStrictEqual([1, 2, 3, 11]);
  });
});
