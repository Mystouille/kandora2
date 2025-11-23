import mongoose from "mongoose";

export enum Ruleset {
  EMA = "EMA",
  WRC = "WRC",
  ONLINE = "ONLINE",
  MLEAGUE = "MLEAGUE",
}
export enum Platform {
  MAJSOUL = "MAJSOUL",
  TENHOU = "TENHOU",
  RIICHICITY = "RIICHICITY",
  IRL = "IRL",
}

const rulesetList = [Ruleset.EMA, Ruleset.WRC, Ruleset.ONLINE, Ruleset.MLEAGUE];
const platformList = [
  Platform.MAJSOUL,
  Platform.TENHOU,
  Platform.RIICHICITY,
  Platform.IRL,
];
const leagueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: Date, required: true },
  finalsCutoffTime: { type: Date, required: false },
  endTime: { type: Date, required: false },
  isOngoing: { type: Boolean, required: true, default: true },
  hasTeams: { type: Boolean, required: true, default: false },
  rules: {
    type: String,
    enum: rulesetList,
    required: true,
  },
  platform: {
    type: String,
    enum: platformList,
    required: true,
  },
});

export const League = mongoose.model("League", leagueSchema);
