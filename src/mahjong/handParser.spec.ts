import { compareTiles, getHandEmojiCodes, splitTiles } from "./handParser";

describe("handParser.ts", () => {
  describe("compareTiles", () => {
    test("returns correct order", () => {
      expect(compareTiles("1s", "3p")).toBe(1);
      expect(compareTiles("3p", "1s")).toBe(-1);
      expect(compareTiles("3s", "1p")).toBe(1);
      expect(compareTiles("3s", "3p")).toBe(1);
      expect(compareTiles("1s", "2p")).toBe(1);
    });
  });

  describe("getHandEmojiCodes", () => {
    it("returns correct emojis", () => {
      let hand = "321p465s123456m45z";
      expect(getHandEmojiCodes(hand, false)).toBe(
        ":3p::2p::1p::4s::6s::5s::1m::2m::3m::4m::5m::6m::4z::5z:"
      );
      expect(getHandEmojiCodes(hand, true)).toBe(
        ":1m::2m::3m::4m::5m::6m::1p::2p::3p::4s::5s::6s::4z::5z:"
      );

      hand = "333p465s123345m45z";
      expect(getHandEmojiCodes(hand, true, true)).toBe(
        ":1m::2m::3m::4m::5m::3p::4s::5s::6s::4z::5z:"
      );
    });
  });

  describe("splitTiles", () => {
    test.each`
      input                 | expected
      ${"111222333p44455s"} | ${"1p1p1p2p2p2p3p3p3p4s4s4s5s5s"}
      ${"abcefghs"}         | ${""}
    `("return expected string", ({ input, expected }) => {
      expect(splitTiles(input).join("")).toBe(expected);
    });
  });
});
