import {
  compareTiles,
  getHandEmojis,
  splitTiles,
  fromStrToHandToDisplay,
} from "./handParser";
import { MeldSource, MeldType } from "./handTypes";

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
      expect(getHandEmojis({ hand, sorted: false }).join("")).toBe(
        "3p2p1p4s6s5s1m2m3m4m5m6m4z5z"
      );
      expect(getHandEmojis({ hand, sorted: true }).join("")).toBe(
        "1m2m3m4m5m6m1p2p3p4s5s6s4z5z"
      );

      hand = "333p465s123345m45z";
      expect(getHandEmojis({ hand, sorted: true, unique: true }).join("")).toBe(
        "1m2m3m4m5m3p4s5s6s4z5z"
      );
    });
  });

  describe("splitTiles", () => {
    test.each`
      input                 | expected
      ${"111222333p44455s"} | ${"1p1p1p2p2p2p3p3p3p4s4s4s5s5s"}
      ${"123m11''1p123s"}   | ${"1m2m3m1p1''p1p1s2s3s"}
      ${"1'23m111p123s"}    | ${"1'm2m3m1p1p1p1s2s3s"}
      ${"abcefghs"}         | ${""}
    `("return expected string", ({ input, expected }) => {
      expect(splitTiles(input).join("")).toBe(expected);
    });
  });

  describe("toHandToDisplay", () => {
    it("returns correct object for closed hand 14 tiles", () => {
      let hand = "111222333p44455s";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "1p1p1p2p2p2p3p3p3p4s4s4s5s5s",
        melds: [],
        lastTileSeparated: true,
      });
    });
    it("returns correct object for closed hand 13 tiles", () => {
      let hand = "111222333p4445s";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "1p1p1p2p2p2p3p3p3p4s4s4s5s",
        melds: [],
        lastTileSeparated: false,
      });
    });
    it("returns correct object for open hand with chii", () => {
      let hand = "111222333p55s 4'56m";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "1p1p1p2p2p2p3p3p3p5s5s",
        melds: [
          { tiles: "4m5m6m", type: MeldType.Chii, source: MeldSource.Kamicha },
        ],
        lastTileSeparated: true,
      });
    });
    it("returns correct object for open hand with pon", () => {
      let hand = "111222333p55s 4'44m";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "1p1p1p2p2p2p3p3p3p5s5s",
        melds: [
          { tiles: "4m4m4m", type: MeldType.Pon, source: MeldSource.Kamicha },
        ],
        lastTileSeparated: true,
      });
    });
    it("returns correct object for open hand with daiminkan toimen", () => {
      let hand = "111222333p55s 444'4m";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "1p1p1p2p2p2p3p3p3p5s5s",
        melds: [
          {
            tiles: "4m4m4m4m",
            type: MeldType.Daiminkan,
            source: MeldSource.Toimen,
          },
        ],
        lastTileSeparated: true,
      });
    });
    it("returns correct object for open hand with daiminkan shimocha", () => {
      let hand = "111222333p55s 4444'm";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "1p1p1p2p2p2p3p3p3p5s5s",
        melds: [
          {
            tiles: "4m4m4m4m",
            type: MeldType.Daiminkan,
            source: MeldSource.Shimocha,
          },
        ],
        lastTileSeparated: true,
      });
    });
    it("returns correct object for open hand with free ankan", () => {
      let hand = "111222333p55s 4444m";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "1p1p1p2p2p2p3p3p3p5s5s",
        melds: [
          {
            tiles: "8z4m4m8z",
            type: MeldType.Ankan,
            source: MeldSource.Self,
          },
        ],
        lastTileSeparated: true,
      });
    });
    it("returns correct object for open hand with ankan", () => {
      let hand = "111222333p55s 8z444m";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "1p1p1p2p2p2p3p3p3p5s5s",
        melds: [
          {
            tiles: "8z4m4m4m",
            type: MeldType.Ankan,
            source: MeldSource.Self,
          },
        ],
        lastTileSeparated: true,
      });
    });

    it("returns correct object for open hand with shouminkan", () => {
      let hand = "111222333p55s 4444''m";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "1p1p1p2p2p2p3p3p3p5s5s",
        melds: [
          {
            tiles: "4m4m4m4m",
            type: MeldType.Shouminkan,
            source: MeldSource.Shimocha,
          },
        ],
        lastTileSeparated: true,
      });
    });
    it("returns correct object for open hand with many calls", () => {
      let hand = "111222p55s 4444''m 33'3m";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "1p1p1p2p2p2p5s5s",
        melds: [
          {
            tiles: "4m4m4m4m",
            type: MeldType.Shouminkan,
            source: MeldSource.Shimocha,
          },
          {
            tiles: "3m3m3m",
            type: MeldType.Pon,
            source: MeldSource.Toimen,
          },
        ],
        lastTileSeparated: true,
      });
    });
    it("returns correct object for open hand with many calls 2", () => {
      let hand = "111222p55s 2'34s 33'3m";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "1p1p1p2p2p2p5s5s",
        melds: [
          {
            tiles: "2s3s4s",
            type: MeldType.Chii,
            source: MeldSource.Kamicha,
          },
          {
            tiles: "3m3m3m",
            type: MeldType.Pon,
            source: MeldSource.Toimen,
          },
        ],
        lastTileSeparated: true,
      });
    });
    it("returns correct object for open hand with many calls 2", () => {
      let hand = "0m 4444''m 1111z 66'66p 1'23s";
      expect(fromStrToHandToDisplay(hand)).toStrictEqual({
        closedTiles: "0m",
        melds: [
          {
            tiles: "4m4m4m4m",
            type: MeldType.Shouminkan,
            source: MeldSource.Shimocha,
          },
          {
            tiles: "8z1z1z8z",
            type: MeldType.Ankan,
            source: MeldSource.Self,
          },
          {
            tiles: "6p6p6p6p",
            type: MeldType.Daiminkan,
            source: MeldSource.Toimen,
          },
          {
            tiles: "1s2s3s",
            type: MeldType.Chii,
            source: MeldSource.Kamicha,
          },
        ],
        lastTileSeparated: false,
      });
    });
  });
});
