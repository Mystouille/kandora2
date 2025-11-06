const tileImgWidth = 80;
const tileImgHeight = 129;
const shrinkFactor = 3.0;
const inputFileName = "tiles.png";
const inputCalledFileName = "tilesCalled.png";
const resourcesInputDirName = "./src/resources/tiles/base/";
const resourcesCacheDirName = "./src/resources/tiles/generated/";
import { loadImage, createCanvas, Image } from "canvas";
import { HandToDisplay, MeldSource, MeldType } from "./handTypes";
import * as fs from "fs";
import { splitTiles } from "./handParser";

async function getAllTiles() {
  return await loadImage(resourcesInputDirName + inputFileName);
}

async function getAllCalledTiles() {
  return await loadImage(resourcesInputDirName + inputCalledFileName);
}

export function handToFileName(hand: HandToDisplay) {
  return `${hand.closedTiles}${hand.melds.length > 0 ? "_" : ""}${hand.melds.map((meld) => `${meld.source}${meld.type}${meld.tiles}`).join("_")}${hand.lastTileSeparated ? "_x" : ""}.png`;
}

export async function writeImage(hand: HandToDisplay) {
  const resImage = await getAllTiles();
  const resImageCalled = await getAllCalledTiles();

  const closedTileList = splitTiles(hand.closedTiles);
  const tileCount =
    closedTileList.length +
    hand.melds
      .map((meld) => {
        switch (meld.type) {
          case MeldType.Chii:
          case MeldType.Pon:
          case MeldType.Shouminkan:
            return 3 as number;
          case MeldType.Daiminkan:
          case MeldType.Ankan:
            return 4 as number;
        }
      })
      .reduce((a, b) => a + b);

  let normalizedWidth = tileCount;
  normalizedWidth += hand.lastTileSeparated ? 0.5 : 0 + hand.melds.length + 0.5; // Adding 0.5 for each gap
  normalizedWidth +=
    hand.melds.filter((meld) => meld.type !== MeldType.Ankan).length * 0.5; // Adding the tilted tiles additional space
  normalizedWidth = Math.floor(normalizedWidth);
  const targetWidth = Math.floor(
    (tileImgWidth * normalizedWidth) / shrinkFactor
  );
  const imageOffset = Math.floor(tileImgWidth / (2 * shrinkFactor));
  const targetHeight = Math.floor(tileImgHeight / shrinkFactor);

  const canvas = createCanvas(targetWidth, targetHeight);
  canvas.getContext("2d");
}

export async function getImageFromTiles(hand: HandToDisplay) {
  const outputFilePath = resourcesCacheDirName + handToFileName(hand);
  if (fs.existsSync(outputFilePath)) {
    if (!fs.existsSync(resourcesCacheDirName)) {
      fs.mkdirSync(resourcesCacheDirName);
    }
    writeImage(hand);
  }
  return loadImage(outputFilePath);
}

export async function load() {
  const simplestHand: HandToDisplay = {
    closedTiles: "123p456m789s12345z",
    melds: [],
    lastTileSeparated: false,
  };
  const handLastTile: HandToDisplay = {
    closedTiles: "123p456m789s12345z",
    melds: [],
    lastTileSeparated: true,
  };
  const handWithMeld: HandToDisplay = {
    closedTiles: "123p456m789s12z",
    melds: [{ tiles: "333z", type: MeldType.Pon, source: MeldSource.Toimen }],
    lastTileSeparated: false,
  };
  const handWithMeldLastTile: HandToDisplay = {
    closedTiles: "123p456m789s12z",
    melds: [{ tiles: "333z", type: MeldType.Pon, source: MeldSource.Toimen }],
    lastTileSeparated: true,
  };
  const handWithMelds: HandToDisplay = {
    closedTiles: "123p456m12z",
    melds: [
      { tiles: "789s", type: MeldType.Chii, source: MeldSource.Kamicha },
      { tiles: "333z", type: MeldType.Pon, source: MeldSource.Toimen },
    ],
    lastTileSeparated: false,
  };
  const image = await getImageFromTiles(handWithMelds);

  console.log(image?.naturalHeight);
  console.log(image?.height);
}
