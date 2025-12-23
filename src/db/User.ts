import mongoose from "mongoose";
import { Game, GameModelName } from "./Game";
import { Team, TeamModelName } from "./Team";
const majsoulIdentitySchema = new mongoose.Schema(
  {
    friendId: { type: String, required: true },
    userId: { type: String, required: false },
    name: { type: String, required: true },
  },
  { _id: false }
);
const tenhouIdentitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { _id: false }
);
const riichiCityIdentitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    id: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: false },
    name: { type: String, required: false },
    majsoulIdentity: { type: majsoulIdentitySchema, required: false },
    tenhouIdentity: { type: tenhouIdentitySchema, required: false },
    riichiCityIdentity: { type: riichiCityIdentitySchema, required: false },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  {
    methods: {},
    statics: {
      async canUserPlayInLeague(userId: string, leagueId: string) {
        // Count games played by user in this league
        const userGamesCount = await Game.countDocuments({
          league: leagueId,
          users: {
            $elemMatch: { $eq: userId },
          },
        });

        // If user has played 5 games or less, they can play
        if (userGamesCount <= 5) {
          return true;
        }

        const userTeam = await Team.getUsersTeam(userId, leagueId);
        const teamId = userTeam ? userTeam._id : null;

        if (!teamId) {
          // User is not in a team, so they can play
          return false;
        }
        // Count games played by the team in this league
        const teamGamesCount = await Game.countDocuments({
          league: leagueId,
          users: {
            $in: userTeam.members,
          },
        });

        // Calculate contribution percentage after next game (rounded down)
        const contributionPercentage = Math.floor(
          ((userGamesCount + 1) / (teamGamesCount + 1)) * 100
        );

        // User can play if contribution is less than 35%
        return contributionPercentage < 35;
      },
    },
  }
);

export const User = mongoose.model("User", userSchema);
