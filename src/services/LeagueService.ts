import { Client } from "discord.js";
import { League, LeagueModel } from "../db/League";
import cron, { ScheduledTask } from "node-cron";
import { MahjongSoulConnector } from "../api/majsoul/data/MajsoulConnector";
import { GameModel } from "../db/Game";
import { UserModel } from "../db/User";
import { TeamModel } from "../db/Team";
import { LeagueRankingMessageModel } from "../db/LeagueRankingMessage";
import { computePlayerDeltas } from "./leagueUtils";
import { localize } from "../utils/localizationUtils";
import { strings, invariantLocale } from "../resources/localization/strings";
import { stringFormat } from "../utils/stringUtils";

export class LeagueService {
  static #instance: LeagueService;

  private leagueAgent: ScheduledTask | undefined;
  private leagueAgent2: ScheduledTask | undefined;

  private constructor() {}
  /**
   * The static getter that controls access to the singleton instance.
   *
   * This implementation allows you to extend the Singleton class while
   * keeping just one instance of each subclass around.
   */
  public static get instance(): LeagueService {
    if (!LeagueService.#instance) {
      LeagueService.#instance = new LeagueService();
    }
    return LeagueService.#instance;
  }

  public async InitLeague(
    client: Client,
    specificLeague?: League
  ): Promise<void> {
    const league = specificLeague
      ? specificLeague
      : await LeagueModel.findOne({
          isOngoing: true,
          tournamentId: { $exists: true, $ne: null },
        }).exec();
    if (!league) {
      console.log("No ongoing league found.");
      return;
    }
    const currentTime = new Date();
    if (currentTime > league.startTime) {
      if (
        league.finalsCutoffTime
          ? currentTime < league.finalsCutoffTime
          : !league.endTime || currentTime < league.endTime
      ) {
        // Schedule a cron job to log "something" every 5 minute of every monday and wednesday starting from 19:00 and stopping at 22:00
        //cron.schedule("*/5 19-22 * * 1,3", async () => {
        this.leagueAgent = cron.schedule(
          "*/5 18-22 3,5,9,11,13,17,19,23,25,27 2 *",
          async () => {
            await this.updateGamesInLeague(league, client);
          }
        );
        this.leagueAgent2 = cron.schedule(
          "*/5 14-18 7,14,21,28 2 *",
          async () => {
            await this.updateGamesInLeague(league, client);
          }
        );
        console.log(
          `League agent for league ${league.name} initialized successfully.`
        );
        await this.updateGamesInLeague(league, client);
      }
    }
  }

  private async updateRankingmessages(league: League, client: Client) {
    // Publish unpublished games first
    await this.publishNewGames(league, client);

    if (!league.rankingChannel) {
      console.log(`No ranking channel configured for league ${league.name}`);
      return;
    }

    const channel = await client.channels.fetch(league.rankingChannel);
    if (!channel?.isSendable()) {
      console.log("League ranking channel is not text based.");
      return;
    }

    // Get all valid games for this league
    const games = await GameModel.find({
      league: league._id,
      isValid: true,
    }).exec();

    // Get all teams in the league
    const teams = await TeamModel.find({ leagueId: league._id }).exec();
    const teamMap = new Map(teams.map((t) => [t._id.toString(), t]));

    // Create a map of userId -> teamId for quick lookup
    const userToTeamMap = new Map<string, string>();
    for (const team of teams) {
      for (const memberId of team.members) {
        userToTeamMap.set(memberId.toString(), team._id.toString());
      }
    }

    // First pass: collect all player scores per team to calculate team totals and player game counts
    const teamPlayerScores = new Map<
      string,
      Map<string, { userId: string; scores: number[] }>
    >();

    for (const game of games) {
      // Compute deltas with tie handling for this game
      const gameResults = game.results as any[];
      const deltas = computePlayerDeltas(gameResults, league.rules);

      for (let i = 0; i < gameResults.length; i++) {
        const result = gameResults[i];
        const userId = result.userId.toString();
        const teamId = userToTeamMap.get(userId);
        if (!teamId) continue; // Skip players not in a team

        if (!teamPlayerScores.has(teamId)) {
          teamPlayerScores.set(teamId, new Map());
        }
        const teamPlayers = teamPlayerScores.get(teamId)!;

        const existing = teamPlayers.get(userId) || {
          userId: userId,
          scores: [] as number[],
        };
        existing.scores.push(deltas[i]);
        teamPlayers.set(userId, existing);
      }
    }

    // Second pass: calculate team scores with the 35% rule
    const teamScores = new Map<
      string,
      { teamId: string; totalScore: number; gamesPlayed: number }
    >();

    const userPendingScores = new Map<
      string,
      { teamId: string; scores: number[] }
    >();

    for (const [teamId, players] of teamPlayerScores) {
      // Calculate total games for this team
      let totalTeamGames = 0;
      for (const player of players.values()) {
        totalTeamGames += player.scores.length;
      }

      let teamTotalScore = 0;
      let teamGamesCountedTotal = 0;

      for (const player of players.values()) {
        const playerGameCount = player.scores.length;

        if (playerGameCount > 6) {
          // Apply 35% rule: limit counted games to 35% of team's total (rounded down)
          const maxGames = Math.floor(totalTeamGames * 0.35);
          const gamesToCount = Math.min(playerGameCount, maxGames);

          // Sort scores ascending (worst first) and take the worst games
          const sortedScores = [...player.scores].sort((a, b) => a - b);
          const countedScores = sortedScores.slice(0, gamesToCount);
          const notCountedScores = sortedScores.slice(gamesToCount);
          if (notCountedScores.length > 0) {
            userPendingScores.set(player.userId, {
              teamId: teamId,
              scores: notCountedScores,
            });
          }
          teamTotalScore += countedScores.reduce((sum, s) => sum + s, 0);
          teamGamesCountedTotal += countedScores.length;
        } else {
          // Count all games for players with 6 or fewer games
          teamTotalScore += player.scores.reduce((sum, s) => sum + s, 0);
          teamGamesCountedTotal += player.scores.length;
        }
      }

      teamScores.set(teamId, {
        teamId: teamId,
        totalScore: Math.round(teamTotalScore * 10) / 10,
        gamesPlayed: teamGamesCountedTotal,
      });
    }

    // Sort teams by total score (descending)
    const sortedTeams = Array.from(teamScores.values()).sort(
      (a, b) => b.totalScore - a.totalScore
    );

    // Build ranking message
    const rankingLines = sortedTeams.map((teamScore, index) => {
      const team = teamMap.get(teamScore.teamId);
      const displayName =
        team?.displayName ||
        team?.simpleName ||
        localize(invariantLocale, strings.system.league.unknownTeam);
      const scoreDisplay =
        teamScore.totalScore >= 0
          ? `\`+${teamScore.totalScore}\``
          : `\`${teamScore.totalScore}\``;
      return stringFormat(
        invariantLocale,
        strings.system.league.rankingLineFormat,
        (index + 1).toString(),
        displayName,
        scoreDisplay,
        teamScore.gamesPlayed.toString()
      );
    });

    // Build pending scores section
    let pendingScoresSection = "";
    if (userPendingScores.size > 0) {
      // Get user information for pending scores
      const userIds = Array.from(userPendingScores.keys());
      const users = await UserModel.find({ _id: { $in: userIds } }).exec();
      const userMap = new Map(users.map((u) => [u._id.toString(), u]));

      const pendingLines: string[] = [];
      for (const [userId, pending] of userPendingScores) {
        const user = userMap.get(userId);
        const team = teamMap.get(pending.teamId);
        const teamMention = team?.roleId
          ? `<@&${team.roleId}>`
          : team?.displayName ||
            team?.simpleName ||
            localize(invariantLocale, strings.system.league.unknownTeam);
        const userMention = user?.discordId
          ? `<@${user.discordId}>`
          : (user?.name ??
            localize(invariantLocale, strings.system.league.unknownUser));
        const majsoulUsername =
          user?.majsoulIdentity?.name ??
          localize(invariantLocale, strings.system.league.unknownUser);
        // Sort scores from highest to lowest and format each individually
        const sortedScores = [...pending.scores].sort((a, b) => b - a);
        const scoresDisplay = sortedScores
          .map((s) => (s >= 0 ? `\`+${s}\`` : `\`${s}\``))
          .join(", ");
        pendingLines.push(
          stringFormat(
            invariantLocale,
            strings.system.league.pendingScoreLineFormat,
            userMention,
            majsoulUsername,
            teamMention,
            scoresDisplay
          )
        );
      }

      if (pendingLines.length > 0) {
        pendingScoresSection = `\n\n${localize(invariantLocale, strings.system.league.pendingScoresHeader)}\n${pendingLines.join("\n")}`;
      }
    }

    const rankingTitle = stringFormat(
      invariantLocale,
      strings.system.league.rankingTitleFormat,
      league.name
    );
    const noGames = localize(
      invariantLocale,
      strings.system.league.noGamesRecorded
    );
    const lastUpdated = stringFormat(
      invariantLocale,
      strings.system.league.lastUpdatedFormat,
      new Date().toLocaleString()
    );
    const message = `${rankingTitle}\n\n${rankingLines.join("\n") || noGames}${pendingScoresSection}\n\n${lastUpdated}`;

    // Check if we already have a ranking message for this league
    const existingMessage = await LeagueRankingMessageModel.findOne({
      league: league._id,
    }).exec();

    if (existingMessage) {
      // Update existing message
      try {
        const discordMessage = await channel.messages.fetch(
          existingMessage.messageId
        );
        await discordMessage.edit(message);
        await LeagueRankingMessageModel.updateOne(
          { _id: existingMessage._id },
          { lastUpdatedAt: new Date() }
        );
        console.log(`Ranking message updated for league ${league.name}`);
      } catch {
        // Message might have been deleted, create a new one
        console.log(
          `Could not find existing ranking message, creating new one`
        );
        const newMessage = await channel.send(message);
        await LeagueRankingMessageModel.updateOne(
          { _id: existingMessage._id },
          { messageId: newMessage.id, lastUpdatedAt: new Date() }
        );
      }
    } else {
      // Create new message
      const newMessage = await channel.send(message);
      await LeagueRankingMessageModel.create({
        messageId: newMessage.id,
        league: league._id,
        lastUpdatedAt: new Date(),
      });
      console.log(`Ranking message created for league ${league.name}`);
    }
  }

  private async publishNewGames(league: League, client: Client) {
    const channel = await client.channels.fetch(league.gameChannel);
    if (!channel?.isSendable()) {
      console.log("League game channel is not text based.");
      return;
    }

    // Get all unpublished games for this league
    const unpublishedGames = await GameModel.find({
      league: league._id,
      isPublished: { $ne: true },
    }).exec();

    // Get all teams in the league for player lookup
    const teams = await TeamModel.find({ leagueId: league._id }).exec();

    for (const game of unpublishedGames) {
      // Get user information for players in this game
      const userIds = (game.results as any[]).map((r) => r.userId);
      const users = await UserModel.find({ _id: { $in: userIds } }).exec();
      const userMap = new Map(users.map((u) => [u._id.toString(), u]));

      // Create a map of userId -> team for quick lookup
      const userToTeamMap = new Map<string, (typeof teams)[0]>();
      for (const team of teams) {
        for (const memberId of team.members) {
          userToTeamMap.set(memberId.toString(), team);
        }
      }

      // Find players not in teams
      const playersNotInTeam: { discordMention: string; nickname: string }[] =
        [];
      for (const result of game.results as any[]) {
        const user = userMap.get(result.userId.toString());
        const isInTeam = userToTeamMap.has(result.userId.toString());
        if (!isInTeam) {
          playersNotInTeam.push({
            discordMention: user?.discordId
              ? `<@${user.discordId}>`
              : (user?.name ?? "Unknown"),
            nickname: user?.name ?? "Unknown",
          });
        }
      }

      // Build scores display with averaged deltas for tied scores
      const sortedResults = [...(game.results as any[])].sort(
        (a, b) => b.score - a.score
      );
      const deltas = computePlayerDeltas(sortedResults, league.rules);
      const scores = sortedResults
        .map((r, idx) => {
          const user = userMap.get(r.userId.toString());
          const team = userToTeamMap.get(r.userId.toString());
          const teamMention = team?.roleId
            ? `<@&${team.roleId}>`
            : team?.displayName || team?.simpleName || "";
          const majsoulUsername = user?.majsoulIdentity?.name ?? "";
          const discordMention = user?.discordId
            ? `<@${user.discordId}>`
            : (user?.name ?? "Unknown");
          const delta = deltas[idx];
          const teamDisplay =
            majsoulUsername || teamMention
              ? ` (${[majsoulUsername, teamMention].filter(Boolean).join(" ")})`
              : "";
          return `${discordMention}${teamDisplay}: \`${r.score}\` => \`${delta > 0 ? "+" : ""}${delta.toFixed(1)}\``;
        })
        .join("\n");

      // Format game start and end times
      const unknownTime = localize(
        invariantLocale,
        strings.system.league.unknownTime
      );
      const startTime = game.startTime
        ? new Date(game.startTime).toLocaleString()
        : unknownTime;
      const endTime = game.endTime
        ? new Date(game.endTime).toLocaleString()
        : unknownTime;

      // Build and send the full game info message
      const startTimeLabel = localize(
        invariantLocale,
        strings.system.league.startTimeLabel
      );
      const endTimeLabel = localize(
        invariantLocale,
        strings.system.league.endTimeLabel
      );
      const gameLinkLabel = localize(
        invariantLocale,
        strings.system.league.gameLinkLabel
      );
      const scoresNotAvailable = localize(
        invariantLocale,
        strings.system.league.scoresNotAvailable
      );

      const sb = [];
      if (game.isValid) {
        sb.push(
          stringFormat(
            invariantLocale,
            strings.system.league.newGameRecordedFormat,
            league.name
          )
        );
        sb.push(`${scores || scoresNotAvailable}`);
        sb.push(`${startTimeLabel} ${startTime}\n${endTimeLabel} ${endTime}`);
        sb.push(`${gameLinkLabel}  ${game.log}`);
      } else {
        sb.push(
          stringFormat(
            invariantLocale,
            strings.system.league.invalidGameDetectedFormat,
            league.name
          )
        );
        sb.push(
          localize(invariantLocale, strings.system.league.playersNotInTeam)
        );
        sb.push(
          playersNotInTeam
            .map((p) => `- ${p.discordMention} (${p.nickname})`)
            .join("\n")
        );
        sb.push(`${scores || scoresNotAvailable}`);
        sb.push(`${gameLinkLabel}  ${game.log}`);
      }

      await channel.send(sb.join("\n\n"));

      // Mark game as published
      await GameModel.updateOne(
        { _id: game._id },
        { isPublished: true }
      ).exec();

      console.log(`Game ${game.gameId} published for league ${league.name}`);
    }
  }

  private async updateGamesInLeague(league: League, client: Client) {
    const gameList =
      await MahjongSoulConnector.instance.getAllContestGameRecords({
        contestId: parseInt(league.tournamentId!),
      });

    for (const game of gameList) {
      const savedGame = await GameModel.findOne({
        gameId: game.uuid,
        league: league._id,
      }).exec();

      if (!savedGame && game.accounts) {
        // Map users to their seats and hydrate from User table
        const playerInfoPromises = game.accounts.map(async (account) => {
          const user = await UserModel.findOne({
            "majsoulIdentity.userId": account.account_id?.toString(),
          }).exec();

          return {
            seat: account.seat ?? 0,
            nickname: account.nickname ?? "Unknown",
            accountId: account.account_id,
            user: user,
            userId: user?._id,
          };
        });

        const players = await Promise.all(playerInfoPromises);
        // Sort by seat for consistent display
        players.sort((a, b) => a.seat - b.seat);

        // Check if all players are in teams in the current league
        const allPlayersAreInDb = players.every((p) => p.user);
        let isValid = false;

        if (allPlayersAreInDb) {
          const userIds = players.map((p) => p.userId!);
          const teamsInLeague = await TeamModel.find({
            leagueId: league._id,
            members: { $in: userIds },
          }).exec();

          // Check if all players are in teams
          const playersNotInTeam = players.filter(
            (player) =>
              !teamsInLeague.some((team) =>
                team.members.some(
                  (member) => member.toString() === player.userId!.toString()
                )
              )
          );
          isValid = playersNotInTeam.length === 0;
        }

        // Get final scores from game result
        const gameResult = game.result;

        const results = gameResult?.players.map((r: any) => {
          const player = players.find((p) => p.seat === r.seat);
          const sortedPlayers = [...gameResult.players].sort(
            (a: any, b: any) => b.part_point_1 - a.part_point_1
          );
          const place =
            sortedPlayers.findIndex((sp: any) => sp.seat === r.seat) + 1;

          return {
            userId: player?.userId,
            score: r.part_point_1 ?? 0,
            place: place,
            nbChombo: 0,
          };
        });

        await GameModel.create({
          gameId: game.uuid,
          name: `${league.name} - ${game.uuid}`,
          platform: "majsoul",
          rules: "ONLINE",
          context: league.name,
          startTime: game.start_time
            ? new Date(game.start_time * 1000)
            : new Date(),
          endTime: game.end_time ? new Date(game.end_time * 1000) : undefined,
          isValid,
          isPublished: false,
          results: results?.filter((r) => r.userId),
          log: `https://mahjongsoul.game.yo-star.com/?paipu=${game.uuid}`,
          league: league._id,
        });

        console.log(
          `Game ${game.uuid} saved to database for league ${league.name}`
        );
      }
    }

    // Update ranking messages after storing all new games
    await this.updateRankingmessages(league, client);
  }
}
