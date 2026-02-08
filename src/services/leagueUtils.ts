import { Ruleset } from "../db/League";
/**
 * Computes placements for players based on their scores.
 * Players with the same score share the same (highest) placement.
 * @param players Array of objects containing at least a score property
 * @returns Array of placements in the same order as the input array
 */
export function computePlacements<T extends { score: number }>(
  players: T[]
): number[] {
  // Create indexed array to track original positions
  const indexed = players.map((p, i) => ({ index: i, score: p.score }));

  // Sort by score descending
  const sorted = [...indexed].sort((a, b) => b.score - a.score);

  // Assign placements (tied scores get the same placement)
  const placements = new Array<number>(players.length);
  for (let i = 0; i < sorted.length; i++) {
    // If same score as previous player, use same placement
    if (i > 0 && sorted[i].score === sorted[i - 1].score) {
      placements[sorted[i].index] = placements[sorted[i - 1].index];
    } else {
      placements[sorted[i].index] = i + 1;
    }
  }

  return placements;
}

/**
 * Computes deltas for all players, averaging placement bonuses for tied scores.
 * @param players Array of objects containing score property
 * @param ruleSet The ruleset to use for computing deltas
 * @returns Array of deltas in the same order as the input array
 */
export function computePlayerDeltas<T extends { score: number }>(
  players: T[],
  ruleSet: Ruleset
): number[] {
  // Create indexed array to track original positions
  const indexed = players.map((p, i) => ({ index: i, score: p.score }));

  // Sort by score descending
  const sorted = [...indexed].sort((a, b) => b.score - a.score);

  // Get place modifiers based on ruleset
  const placeModifiers = getPlaceModifiers(ruleSet);
  const startingScore = getStartingScore(ruleSet);

  // Group tied players and compute averaged deltas
  const deltas = new Array<number>(players.length);
  let i = 0;
  while (i < sorted.length) {
    // Find all players with the same score
    const tiedPlayers = [sorted[i]];
    let j = i + 1;
    while (j < sorted.length && sorted[j].score === sorted[i].score) {
      tiedPlayers.push(sorted[j]);
      j++;
    }

    // Calculate averaged place modifier for tied players
    let totalPlaceModifier = 0;
    for (let k = 0; k < tiedPlayers.length; k++) {
      const place = i + k; // 0-indexed place
      totalPlaceModifier += placeModifiers[place] ?? 0;
    }
    const averagedPlaceModifier = totalPlaceModifier / tiedPlayers.length;

    // Assign delta to each tied player
    for (const player of tiedPlayers) {
      const baseDelta = parseFloat(
        ((player.score - startingScore) / 1000).toFixed(1)
      );
      deltas[player.index] = parseFloat(
        (baseDelta + averagedPlaceModifier).toFixed(1)
      );
    }

    i = j;
  }

  return deltas;
}

function getPlaceModifiers(ruleSet: Ruleset): number[] {
  switch (ruleSet) {
    case Ruleset.EMA:
    case Ruleset.WRC:
      return [15, 5, -5, -15];
    case Ruleset.MLEAGUE:
      return [45, 5, -15, -35];
    default:
      return [0, 0, 0, 0];
  }
}

function getStartingScore(ruleSet: Ruleset): number {
  switch (ruleSet) {
    case Ruleset.EMA:
    case Ruleset.WRC:
      return 30000;
    case Ruleset.MLEAGUE:
      return 25000;
    default:
      return 25000;
  }
}
