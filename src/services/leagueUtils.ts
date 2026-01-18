import { Ruleset } from "../db/League";

export function computePlayerDelta(
  score: number,
  place: number,
  ruleSet: Ruleset
): number {
  switch (ruleSet) {
    case Ruleset.EMA:
      return computeEMADelta(score, place);
    case Ruleset.WRC:
      return computeWRCDelta(score, place);
    case Ruleset.MLEAGUE:
      return computeMLeagueDelta(score, place);
    default:
      return 0;
  }
}

function computeEMADelta(score: number, place: number): number {
  const baseDelta = parseInt(((score - 30000) / 1000).toFixed(1));
  const placeModifier = [15, 5, -5, -15][place - 1];
  return baseDelta + placeModifier;
}

function computeWRCDelta(score: number, place: number): number {
  return computeEMADelta(score, place);
}

function computeMLeagueDelta(score: number, place: number): number {
  const baseDelta = parseInt(((score - 25000) / 1000).toFixed(1));
  const placeModifier = [40, 10, -10, -20][place - 1];
  return baseDelta + placeModifier;
}
