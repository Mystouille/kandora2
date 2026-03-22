import mongoose from "mongoose";
import { Bracket, BracketModel } from "../db/Bracket";
import { GameModel } from "../db/Game";
import { TeamModel } from "../db/Team";
import { League, Ruleset } from "../db/League";
import { computePlayerDeltas } from "./leagueUtils";

/**
 * LFCR bracket stage definitions.
 *
 * QF1: seeds 5, 6, 11, 12
 * QF2: seeds 7, 8, 9, 10
 * DF1: seeds 1, 4 + QF1-2nd + QF2-1st
 * DF2: seeds 2, 3 + QF1-1st + QF2-2nd
 * FINALE: DF1-1st, DF1-2nd, DF2-1st, DF2-2nd
 */

export interface StageSource {
  stage: string;
  place: number;
}

export interface BracketStageDefinition {
  name: string;
  order: number;
  seeds: number[];
  fromStages: StageSource[];
  advancementLabel: string;
}

export const LFCR_STAGES: BracketStageDefinition[] = [
  {
    name: "QF1",
    order: 0,
    seeds: [5, 6, 11, 12],
    fromStages: [],
    advancementLabel: "1er → DF2 · 2ème → DF1",
  },
  {
    name: "QF2",
    order: 1,
    seeds: [7, 8, 9, 10],
    fromStages: [],
    advancementLabel: "1er → DF1 · 2ème → DF2",
  },
  {
    name: "DF1",
    order: 2,
    seeds: [1, 4],
    fromStages: [
      { stage: "QF1", place: 2 },
      { stage: "QF2", place: 1 },
    ],
    advancementLabel: "1er et 2ème → FINALE",
  },
  {
    name: "DF2",
    order: 3,
    seeds: [2, 3],
    fromStages: [
      { stage: "QF1", place: 1 },
      { stage: "QF2", place: 2 },
    ],
    advancementLabel: "1er et 2ème → FINALE",
  },
  {
    name: "FINALE",
    order: 4,
    seeds: [],
    fromStages: [
      { stage: "DF1", place: 1 },
      { stage: "DF1", place: 2 },
      { stage: "DF2", place: 1 },
      { stage: "DF2", place: 2 },
    ],
    advancementLabel: "",
  },
];

export const GAMES_PER_STAGE = 16;

export interface StageTeamResult {
  teamId: string;
  teamName: string;
  totalScore: number;
  gamesPlayed: number;
}

export interface ComputedStage {
  definition: BracketStageDefinition;
  teams: string[]; // team IDs
  results: StageTeamResult[];
  isComplete: boolean;
  gamesPlayed: number;
}

/**
 * Resolves the teams for each bracket stage based on seedings and prior stage results.
 */
function resolveStageTeams(
  stageDef: BracketStageDefinition,
  seedings: Map<number, string>,
  completedStages: Map<string, ComputedStage>
): string[] {
  const teams: string[] = [];

  // Add teams from direct seedings
  for (const seed of stageDef.seeds) {
    const teamId = seedings.get(seed);
    if (teamId) {
      teams.push(teamId);
    }
  }

  // Add teams from previous stage results (only if that stage is complete)
  for (const source of stageDef.fromStages) {
    const prevStage = completedStages.get(source.stage);
    if (
      prevStage &&
      prevStage.isComplete &&
      prevStage.results.length >= source.place
    ) {
      teams.push(prevStage.results[source.place - 1].teamId);
    }
  }

  return teams;
}

/**
 * Computes the results for a single bracket stage from the league's games.
 */
async function computeStageResults(
  league: League,
  stageTeamIds: string[],
  rules: Ruleset
): Promise<{ results: StageTeamResult[]; gamesPlayed: number }> {
  if (stageTeamIds.length === 0) {
    return { results: [], gamesPlayed: 0 };
  }

  // Get all valid games for this league
  const games = await GameModel.find({
    league: league._id,
    isValid: true,
  }).exec();

  // Get all teams in the league for player-to-team mapping
  const teams = await TeamModel.find({ leagueId: league._id }).exec();
  const teamMap = new Map(teams.map((t) => [t._id.toString(), t]));

  // Build userId -> teamId map (including substitutes)
  const userToTeamMap = new Map<string, string>();
  for (const team of teams) {
    for (const memberId of team.members) {
      userToTeamMap.set(memberId.toString(), team._id.toString());
    }
    for (const subId of team.substitutes ?? []) {
      userToTeamMap.set(subId.toString(), team._id.toString());
    }
  }

  const stageTeamSet = new Set(stageTeamIds);

  // Accumulate scores per team
  const teamScores = new Map<
    string,
    { totalScore: number; gamesPlayed: number }
  >();
  for (const teamId of stageTeamIds) {
    teamScores.set(teamId, { totalScore: 0, gamesPlayed: 0 });
  }

  let totalGames = 0;

  for (const game of games) {
    const gameResults = game.results as any[];
    // Determine which teams are in this game
    const gameTeamIds = new Set<string>();
    for (const result of gameResults) {
      const teamId = userToTeamMap.get(result.userId.toString());
      if (teamId) gameTeamIds.add(teamId);
    }

    // Check if this game belongs to this stage:
    // all game teams must be in the stage teams, and vice versa
    if (gameTeamIds.size !== stageTeamSet.size) continue;
    let allMatch = true;
    for (const tid of gameTeamIds) {
      if (!stageTeamSet.has(tid)) {
        allMatch = false;
        break;
      }
    }
    if (!allMatch) continue;

    // This game belongs to this stage
    totalGames++;
    const deltas = computePlayerDeltas(gameResults, rules);
    for (let i = 0; i < gameResults.length; i++) {
      const teamId = userToTeamMap.get(gameResults[i].userId.toString());
      if (teamId && teamScores.has(teamId)) {
        const entry = teamScores.get(teamId)!;
        entry.totalScore += deltas[i];
        entry.gamesPlayed++;
      }
    }
  }

  // Build sorted results
  const results: StageTeamResult[] = [];
  for (const [teamId, scores] of teamScores) {
    const team = teamMap.get(teamId);
    results.push({
      teamId,
      teamName: team?.displayName || team?.simpleName || "?",
      totalScore: Math.round(scores.totalScore * 10) / 10,
      gamesPlayed: scores.gamesPlayed,
    });
  }

  results.sort((a, b) => b.totalScore - a.totalScore);

  return { results, gamesPlayed: totalGames };
}

/**
 * Computes all bracket stages for an LFCR_FINAL league.
 */
export async function computeLfcrBracket(
  league: League,
  bracket: Bracket
): Promise<ComputedStage[]> {
  // Build seedings map: seed number -> teamId
  const seedings = new Map<number, string>();
  for (const s of bracket.seedings) {
    seedings.set(s.seed, (s.teamId as mongoose.Types.ObjectId).toString());
  }

  const completedStages = new Map<string, ComputedStage>();
  const allStages: ComputedStage[] = [];

  for (const stageDef of LFCR_STAGES) {
    const stageTeamIds = resolveStageTeams(stageDef, seedings, completedStages);

    let results: StageTeamResult[] = [];
    let gamesPlayed = 0;

    if (
      stageTeamIds.length ===
      stageDef.seeds.length + stageDef.fromStages.length
    ) {
      // All teams are known, compute results from games
      const computed = await computeStageResults(
        league,
        stageTeamIds,
        league.rules
      );
      results = computed.results;
      gamesPlayed = computed.gamesPlayed;
    }

    const stage: ComputedStage = {
      definition: stageDef,
      teams: stageTeamIds,
      results,
      isComplete: gamesPlayed >= GAMES_PER_STAGE,
      gamesPlayed,
    };

    allStages.push(stage);
    completedStages.set(stageDef.name, stage);
  }

  return allStages;
}

/**
 * Renders an ASCII bracket tree for Discord display.
 */
export function renderBracketAscii(
  leagueName: string,
  stages: ComputedStage[],
  seedings: Map<number, string>,
  teamNames: Map<string, string>
): string {
  // Reverse seedings to look up seed number by team ID
  const teamToSeed = new Map<string, number>();
  for (const [seed, teamId] of seedings) {
    teamToSeed.set(teamId, seed);
  }

  // Compute max team name length across all stages for alignment
  const maxNameLen = Math.max(
    ...stages.flatMap((s) => s.results.map((r) => r.teamName.length)),
    0
  );

  const lines: string[] = [];
  lines.push(`🏆 ${leagueName} - Phases finales`);
  lines.push("");

  for (const stage of stages) {
    const def = stage.definition;

    const gamesPlayed = stage.gamesPlayed;
    const progressLabel =
      stage.results.length > 0 ? ` (${gamesPlayed}/${GAMES_PER_STAGE})` : "";
    lines.push(`━━ ${def.name}${progressLabel} ━━`);

    // Show results
    if (stage.results.length > 0) {
      for (let i = 0; i < stage.results.length; i++) {
        const r = stage.results[i];
        const score =
          r.totalScore >= 0
            ? `+${r.totalScore.toFixed(1)}`
            : r.totalScore.toFixed(1);
        const name = r.teamName.padEnd(maxNameLen);
        lines.push(`  ${i + 1}. ${name} ${score.padStart(7)}`);
      }
    } else if (stage.teams.length > 0) {
      for (const teamId of stage.teams) {
        const name = teamNames.get(teamId) ?? "?";
        const seed = teamToSeed.get(teamId);
        const seedLabel = seed ? ` (seed ${seed})` : "";
        lines.push(`  · ${name}${seedLabel}`);
      }
    } else {
      lines.push("  À déterminer");
    }

    // Show advancement
    if (def.advancementLabel) {
      lines.push(`  → ${def.advancementLabel}`);
    }

    lines.push("");
  }

  return "```\n" + lines.join("\n") + "```";
}

function ordinal(n: number): string {
  return n === 1 ? "1er" : `${n}ème`;
}

/**
 * Loads the bracket for a league and renders the ASCII bracket tree.
 * Returns null if no bracket exists.
 */
export async function getBracketMessage(
  league: League
): Promise<string | null> {
  const bracket = await BracketModel.findOne({ league: league._id }).exec();
  if (!bracket || bracket.seedings.length === 0) {
    return null;
  }

  const stages = await computeLfcrBracket(league, bracket as Bracket);

  // Build seedings and team names maps
  const seedings = new Map<number, string>();
  for (const s of bracket.seedings) {
    seedings.set(s.seed, (s.teamId as mongoose.Types.ObjectId).toString());
  }

  // Get all team names
  const allTeamIds = new Set<string>();
  for (const s of bracket.seedings) {
    allTeamIds.add((s.teamId as mongoose.Types.ObjectId).toString());
  }
  for (const stage of stages) {
    for (const teamId of stage.teams) {
      allTeamIds.add(teamId);
    }
  }

  const teams = await TeamModel.find({
    _id: { $in: Array.from(allTeamIds) },
  }).exec();
  const teamNames = new Map<string, string>();
  for (const team of teams) {
    teamNames.set(team._id.toString(), team.displayName || team.simpleName);
  }

  return renderBracketAscii(league.name, stages, seedings, teamNames);
}
