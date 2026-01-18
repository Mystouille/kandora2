import { Client } from "discord.js";
import { League, LeagueModel } from "../db/League";
import cron, { ScheduledTask } from "node-cron";
import { MahjongSoulConnector } from "../api/majsoul/data/MajsoulConnector";

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
        this.leagueAgent = cron.schedule("*/1 11-22 * * 1,7", async () => {
          const list = await MahjongSoulConnector.instance.fetchPlayerReadyList(
            league.tournamentId!
          );
          console.log(list.map((x) => x.nickname).join(", "));
        });
        const list = await MahjongSoulConnector.instance.fetchPlayerReadyList(
          league.tournamentId!
        );
        console.log(list.length);
        console.log(
          `League agent for league ${league.name} initialized successfully.`
        );
      }
    }
  }
}
