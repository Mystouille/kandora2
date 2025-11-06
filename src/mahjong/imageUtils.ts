const tileImgWidth = 80;
const tileImgHeight = 129;
const resourceFileWidth = tileImgWidth * 10;
const resourceFileHeight = tileImgHeight * 4;

const tiltedTileImgWidth = 116;
const tiltedTileImgHeight = 91;
const tiltedResourceFileWidth = tiltedTileImgWidth * 10;
const tiltedResourceFileHeight = tiltedTileImgHeight * 4;

const shrinkFactor = 3.0;
const inputFileName = "tiles.png";
const inputCalledFileName = "tilesCalled.png";
const resourcesInputDirName = "./src/resources/tiles/base/";
const resourcesCacheDirName = "./src/resources/tiles/generated/";
import { loadImage, createCanvas, Image, DOMMatrix } from "canvas";
import { HandToDisplay, MeldSource, MeldType } from "./handTypes";
import * as fs from "fs";
import { splitTiles } from "./handParser";

async function getAllTiles() {
  return await loadImage(resourcesInputDirName + inputFileName);
}

async function getAllTiltedTiles() {
  return await loadImage(resourcesInputDirName + inputCalledFileName);
}

export function handToFileName(hand: HandToDisplay) {
  return `${hand.closedTiles}${hand.melds.length > 0 ? "_" : ""}${hand.melds.map((meld) => `${meld.source}${meld.type}${meld.tiles}`).join("_")}${hand.lastTileSeparated ? "_x" : ""}.png`;
}

export async function writeImage(hand: HandToDisplay) {
  const resImage = await getAllTiles();
  const resImageTilted = await getAllTiltedTiles();
  const closedTileList = splitTiles(hand.closedTiles);
  const tileCountList = hand.melds.map((meld) => {
    switch (meld.type) {
      case MeldType.Chii:
      case MeldType.Pon:
      case MeldType.Shouminkan:
        return 3 as number;
      case MeldType.Daiminkan:
      case MeldType.Ankan:
        return 4 as number;
    }
  });

  const tileCount =
    closedTileList.length +
    (tileCountList.length > 1 ? tileCountList.reduce((a, b) => a + b) : 0);

  let normalizedWidth = tileCount;
  normalizedWidth += hand.lastTileSeparated ? 0.5 : 0 + hand.melds.length + 0.5; // Adding 0.5 for each gap
  normalizedWidth +=
    hand.melds.filter((meld) => meld.type !== MeldType.Ankan).length * 0.5; // Adding the tilted tiles additional space
  normalizedWidth = Math.floor(normalizedWidth);
  const verticalTileWidth = Math.floor(tileImgWidth / shrinkFactor);
  const horizontalTileWidth = Math.floor(tiltedTileImgWidth / shrinkFactor);

  const targetWidth = Math.floor(verticalTileWidth * normalizedWidth);

  const imageOffset = Math.floor(verticalTileWidth / 2);
  const targetHeight = Math.floor(tileImgHeight / shrinkFactor);

  const sourceCanvas = createCanvas(resourceFileWidth, resourceFileHeight);
  const sourceContext = sourceCanvas.getContext("2d");
  sourceContext.drawImage(resImage, 0, 0);

  const sourceCanvasTilted = createCanvas(
    tiltedResourceFileWidth,
    tiltedResourceFileHeight
  );
  const sourceContextTilted = sourceCanvasTilted.getContext("2d");
  sourceContextTilted.drawImage(resImageTilted, 0, 0);

  const targetCanvas = createCanvas(targetWidth, targetHeight);
  const targetContext = targetCanvas.getContext("2d");
  const transform = new DOMMatrix();
  transform.scaleSelf(1 / shrinkFactor, 1 / shrinkFactor);
  targetContext.setTransform(transform);

  let targetX = 0;
  let targetY = 0;
  closedTileList.forEach((tile) => {
    const tileArea = getTileArea(tile, true);
    const tileData = sourceContext.getImageData(
      tileArea.x,
      tileArea.y,
      tileArea.width,
      tileArea.height
    );
    const blankTilePos = getBlankTileCorner(tile, true);
    targetContext.putImageData(tileData, blankTilePos.x, blankTilePos.y);
    targetX += tileArea.width;
  });

  const out = fs.createWriteStream(resourcesCacheDirName + "test.png");
  const stream = targetCanvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("image written!"));
}

export async function generateTiltedTiles() {
  const resImageTilted = await loadImage(
    resourcesInputDirName + "tilesCalledOld.png"
  );
  const resImageBlank = await loadImage(
    resourcesInputDirName + "tilesCalledBlank.png"
  );

  const closedTileList = splitTiles(
    "0123456789s0123456789m0123456789p12345670z"
  );

  const sourceCanvasTilted = createCanvas(
    resourceFileHeight,
    resourceFileWidth
  );
  const sourceContextTilted = sourceCanvasTilted.getContext("2d");
  sourceContextTilted.drawImage(resImageTilted, 0, 0);

  const sourceCanvasBlank = createCanvas(
    tiltedResourceFileWidth,
    tiltedResourceFileHeight
  );
  const sourceContextBlank = sourceCanvasBlank.getContext("2d");
  sourceContextBlank.drawImage(resImageBlank, 0, 0);

  const oldMarginLeft = 21;
  const oldMarginRight = 6;
  const oldMarginTop = 4;
  const oldMarginBot = 4;

  const newMarginLeft = 5;
  const newMarginTop = 17;

  closedTileList.forEach((tile) => {
    const tilePos = getTileArea(tile, true);

    const tileSymbol = sourceContextTilted.getImageData(
      tilePos.x + oldMarginLeft,
      tilePos.y + oldMarginTop,
      tilePos.width - oldMarginLeft - oldMarginRight,
      tilePos.height - oldMarginTop - oldMarginBot
    );
    const blankTilePos = getBlankTileCorner(tile, true);
    sourceContextBlank.putImageData(
      tileSymbol,
      blankTilePos.x + newMarginLeft,
      blankTilePos.y + newMarginTop
    );
  });

  const out = fs.createWriteStream(resourcesCacheDirName + "out.png");
  const stream = sourceCanvasBlank.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("image written!"));
}

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function getTileArea(tile: string, isTilted: boolean = false): Rectangle {
  const tileNumber = parseInt(tile[0]);
  let virtualXPos = tileNumber;
  let virtualYPos = 0;
  switch (tile[1]) {
    case "s":
      virtualYPos = 0;
      break;
    case "m":
      virtualYPos = 1;
      break;
    case "p":
      virtualYPos = 2;
      break;
    case "z":
      virtualYPos = 3;
      virtualXPos = (tileNumber - 1) % 7;
  }

  if (isTilted) {
    return {
      x: virtualYPos * tileImgHeight,
      y: (9 - virtualXPos) * tileImgWidth,
      width: tileImgHeight,
      height: tileImgWidth,
    };
  }
  return {
    x: virtualXPos * tileImgWidth,
    y: virtualYPos * tileImgHeight,
    width: tileImgWidth,
    height: tileImgHeight,
  };
}

function getBlankTileCorner(
  tile: string,
  isTilted: boolean = false
): Rectangle {
  const tileNumber = parseInt(tile[0]);
  let virtualXPos = tileNumber;
  let virtualYPos = 0;
  switch (tile[1]) {
    case "s":
      virtualYPos = 0;
      break;
    case "m":
      virtualYPos = 1;
      break;
    case "p":
      virtualYPos = 2;
      break;
    case "z":
      virtualYPos = 3;
      virtualXPos = (tileNumber - 1) % 7;
  }
  return {
    x: virtualXPos * tiltedTileImgWidth,
    y: virtualYPos * tiltedTileImgHeight,
    width: tiltedTileImgWidth,
    height: tiltedTileImgHeight,
  };
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
    closedTiles: "0123456789s0123456789m0123456789p12345670z",
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
  await writeImage(handLastTile);
}
