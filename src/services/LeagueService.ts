import { Client } from "discord.js";
import { LeagueModel } from "../db/League";
import cron from "node-cron";
import mongoose from "mongoose";

export class LeagueService {
  static #instance: LeagueService;

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

  public async InitLeague(client: Client): Promise<void> {
    const league = await LeagueModel.findOne({
      isOngoing: true,
      majsoulTournamentId: { $exists: true, $ne: null },
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
        // Schedule a cron job to log "bla" every 5 minute of every monday and wednesday starting from 19:00 and stopping at 22:00
        cron.schedule("*/5 19-22 * * 1,3", async () => {
          console.log(
            `Checking league ${league.name} standings at ${new Date().toISOString()}`
          );
        });
      }
    }
  }
}
