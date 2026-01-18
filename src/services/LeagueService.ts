import { Client } from "discord.js";
import { League, LeagueModel } from "../db/League";
import cron, { ScheduledTask } from "node-cron";
import { MahjongSoulConnector } from "../api/majsoul/data/MajsoulConnector";
import { GameModel } from "../db/Game";
import { UserModel } from "../db/User";
import { TeamModel } from "../db/Team";
import { LeagueRankingMessageModel } from "../db/LeagueRankingMessage";
import { PlayerResult } from "../api/majsoul/data/types/RecordGameGameEndResult";
import { computePlayerDelta } from "./leagueUtils";

export class LeagueService {
  static #instance: LeagueService;

  private leagueAgent: ScheduledTask | undefined;

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
        this.leagueAgent = cron.schedule("*/5 11-24 * * *", async () => {
          await this.updateGamesInLeague(league, client);
        });
        const list =
          await MahjongSoulConnector.instance.getAllContestGameRecords(
            parseInt(league.tournamentId!)
          );
        console.log(list.length);
        console.log(
          `League agent for league ${league.name} initialized successfully.`
        );
        await this.updateGamesInLeague(league, client);
      }
    }
  }

  private async updateRankingmessage(league: League, client: Client) {
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
      for (const result of game.results as any[]) {
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
        existing.scores.push(
          computePlayerDelta(result.score, result.place, league.rules)
        );
        teamPlayers.set(userId, existing);
      }
    }

    // Second pass: calculate team scores with the 35% rule
    const teamScores = new Map<
      string,
      { teamId: string; totalScore: number; gamesPlayed: number }
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
        totalScore: teamTotalScore,
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
        team?.displayName || team?.simpleName || "Unknown Team";
      const scoreDisplay =
        teamScore.totalScore >= 0
          ? `+${teamScore.totalScore}`
          : `${teamScore.totalScore}`;
      return `**${index + 1}.** ${displayName} - ${scoreDisplay} (${teamScore.gamesPlayed} games)`;
    });

    const message = `**🏆 ${league.name} Team Rankings**\n\n${rankingLines.join("\n") || "No games recorded yet."}\n\n_Last updated: ${new Date().toLocaleString()}_`;

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
      } catch (error) {
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

  private async updateGamesInLeague(league: League, client: Client) {
    Promise.all([
      client.channels.fetch(league.gameChannel),
      MahjongSoulConnector.instance.getAllContestGameRecords(
        parseInt(league.tournamentId!)
      ),
    ]).then(async ([channel, gameList]) => {
      if (!channel?.isSendable()) {
        console.log("League game channel is not text based.");
        return;
      }

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
              discordId: user?.discordId,
              discordMention: user?.discordId
                ? `<@${user.discordId}>`
                : account.nickname,
            };
          });

          const players = await Promise.all(playerInfoPromises);
          // Sort by seat for consistent display
          players.sort((a, b) => a.seat - b.seat);

          // Check if all players are in teams in the current league
          const allPlayersAreInDb = players.every((p) => p.user);
          let isValid = false;
          let playersNotInTeam: typeof players = [];

          if (allPlayersAreInDb) {
            const userIds = players.map((p) => p.userId!.toString());
            const teamsInLeague = await TeamModel.find({
              leagueId: league._id,
              members: { $in: userIds },
            }).exec();

            // Check if all players are in teams
            playersNotInTeam = players.filter(
              (player) =>
                !teamsInLeague.some((team) =>
                  team.members.some(
                    (member) => member.toString() === player.userId!.toString()
                  )
                )
            );
            isValid = playersNotInTeam.length === 0;
          } else {
            // Players not in the DB are also considered not in a team
            playersNotInTeam = players.filter((p) => !p.user);
          }

          // Get final scores from game result
          const gameResult = game.result;
          const scores = gameResult?.players
            ?.map((r: PlayerResult) => {
              const player = players.find((p) => p.seat === r.seat);
              return `${player?.discordMention}: ${r.part_point_1 ?? 0} => \`${r.total_point > 0 ? "+" : ""}${(r.total_point / 1000)?.toFixed(1) ?? 0}\``;
            })
            .join("\n");

          // Format game start and end times
          const startTime = game.start_time
            ? new Date(game.start_time * 1000).toLocaleString()
            : "Unknown";
          const endTime = game.end_time
            ? new Date(game.end_time * 1000).toLocaleString()
            : "Unknown";

          // Build and send the full game info message
          let sb = [];
          if (isValid) {
            sb.push(`**New game recorded for league ${league.name}**)`);
            sb.push(`${scores || "Scores not available"}`);
            sb.push(`**Start Time:** ${startTime}\n**End Time:** ${endTime}`);
            sb.push(
              `**Game Link:**  https://mahjongsoul.game.yo-star.com/?paipu=${game.uuid}`
            );
          } else {
            sb.push(`**Invalid game detected for league ${league.name}**)`);
            sb.push(
              `Not all players are registered in a team for this league:`
            );
            sb.push(
              playersNotInTeam
                .map((p) => `- ${p.discordMention} (${p.nickname})`)
                .join("\n")
            );
            sb.push(`${scores || "Scores not available"}`);
            sb.push(
              `**Game Link:**  https://mahjongsoul.game.yo-star.com/?paipu=${game.uuid}`
            );
          }

          await channel.send(sb.join("\n\n"));

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
            results: results?.filter((r) => r.userId),
            log: `https://mahjongsoul.game.yo-star.com/?paipu=${game.uuid}`,
            league: league._id,
          });

          console.log(
            `Game ${game.uuid} saved to database for league ${league.name}`
          );

          // Update ranking message after saving a valid game
          if (isValid) {
            await this.updateRankingmessage(league, client);
          }
        }
      }
    });
  }
}
