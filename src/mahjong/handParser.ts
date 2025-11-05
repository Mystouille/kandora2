import { Client, Emoji } from "discord.js";

const SUIT_NAMES = ["p", "m", "s", "z"];

function getEmojiCode(tileName: string): string {
  return `:${tileName}:`;
}

function isDigit(str: string): boolean {
  return str >= "0" && str <= "9";
}

function isCalled(str: string): boolean {
  return str === "'";
}

export function splitTiles(hand: string) {
  const tiles: string[] = [];
  let i = 0;
  let k = 0;
  while (i < hand.length) {
    if (SUIT_NAMES.includes(hand[i])) {
      const tileSuit = hand[i];
      for (let j = k; j < i; j++) {
        const tileNumber = hand[j];
        if (!isDigit(tileNumber)) {
          continue;
        }
        let called = "";
        if (isCalled(hand[j + 1])) {
          called += "'";
          j++;
        }
        const tileToAdd = `${tileNumber}${called}${tileSuit}`;
        tiles.push(tileToAdd);
      }
      k = i + 1;
    } else if (!isDigit(hand[i]) && !isCalled(hand[i])) {
      k = i + 1;
    }
    i++;
  }
  return tiles;
}

export function compareTiles(A: string, B: string): number {
  const a = A[A.length - 1];
  const b = B[B.length - 1];
  const x = A[0];
  const y = B[0];
  return a > b ? 1 : a < b ? -1 : x > y ? 1 : x < y ? -1 : A.length - B.length;
}

export function getHandEmojiCodes(
  hand: string,
  sorted: boolean = false,
  unique: boolean = false,
): string {
  let tileList = splitTiles(hand);

  if (sorted) {
    tileList = tileList.sort(compareTiles);
  }

  let handEmojiList = tileList.map((x) => getEmojiCode(x));
  if (unique) {
    handEmojiList = [...new Set(handEmojiList)];
  }

  return handEmojiList.join("");
}
