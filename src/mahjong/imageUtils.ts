const tileImgWidth = 80;
const tileImgHeight = 129;
const shrinkFactor = 3.0;
const inputFileName = "tiles.png";
const inputCalledFileName = "tilesCalled.png";
const resourcesDirName = "resources/tiles/";
import { loadImage, createCanvas } from "canvas";

export function load() {
  loadImage("resources/tiles/tiles.png");
}
