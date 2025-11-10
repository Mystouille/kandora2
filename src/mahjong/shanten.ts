import { addTileStrTo9997, fromStrToTile9997 } from "./handConverter";
import * as shantenCalc from "syanten";
import { fromStrToHandToDisplay } from "./handParser";

type Wait = {
  nbTile: number;
  tile: string;
  goodTenpai: boolean;
};

type Ukeire = {
  tile: string;
  waits: Wait[];
  nbGoodTenpaiWaits: number;
  nbTotalWaits: number;
};

export type Hairi = {
  shanten: number;
  ukeire: Ukeire[];
};

/**
 * Returns the extended wait info about a hand (the waits improving the hand after each possible discard)
 * @param hand - A strict natural representation of the hand (and no aka)
 */
export function getHairi(handStr: string): Hairi {
  const tile9997 = fromStrToTile9997(handStr);
  const hairi = shantenCalc.hairi(tile9997);
  const goodWaitLimit = 5;
  const hairiExt: Ukeire[] = [];
  let shanten = 0;

  Object.entries(hairi).forEach((entryCut) => {
    const toCut = entryCut[0];
    if (toCut === "now") {
      shanten = entryCut[1] as number;
      return;
    }
    let nbGoodTenpaiWaits = 0;
    let nbTotalWaits = 0;
    addTileStrTo9997(toCut, tile9997, -1);
    const waits: Wait[] = [];
    Object.entries(entryCut[1] as Object).forEach((entryDraw) => {
      const toDraw = entryDraw[0];
      const nbTile = entryDraw[1];
      addTileStrTo9997(toDraw, tile9997, 1);
      const tenpai = shantenCalc.hairi(tile9997);
      let maxWaits = 0;
      Object.entries(tenpai as Object).forEach((tenpaiDiscard) => {
        if (tenpaiDiscard[0] === "now") {
          return;
        }
        let nbWaits = 0;
        Object.values(tenpaiDiscard[1] as Object).forEach((nbAgari) => {
          nbWaits += nbAgari;
        });
        maxWaits = Math.max(maxWaits, nbWaits);
      });
      nbTotalWaits += nbTile;
      nbGoodTenpaiWaits += maxWaits >= goodWaitLimit ? nbTile : 0;
      waits.push({
        tile: toDraw,
        goodTenpai: maxWaits >= goodWaitLimit,
        nbTile,
      });
      addTileStrTo9997(toDraw, tile9997, -1);
    });

    const discardStr = JSON.stringify({
      waits,
      nbGoodTenpaiWaits,
      nbTotalWaits,
    });
    const similarWait = hairiExt.find(
      (h) =>
        JSON.stringify({
          waits: h.waits,
          nbGoodTenpaiWaits: h.nbGoodTenpaiWaits,
          nbTotalWaits: h.nbTotalWaits,
        }) === discardStr
    );

    if (similarWait) {
      similarWait.tile += toCut;
    } else {
      hairiExt.push({ tile: toCut, waits, nbGoodTenpaiWaits, nbTotalWaits });
    }
    addTileStrTo9997(toCut, tile9997, 1);
  });
  return { shanten, ukeire: hairiExt };
}
