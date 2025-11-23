import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    score: { type: Number, required: true },
    place: { type: Number, required: true },
    nbChombo: { type: Number, required: true },
    subId: { type: mongoose.Schema.Types.ObjectId, required: false },
  },
  { _id: false }
);
const gameSchema = new mongoose.Schema({
  name: { type: String, required: false },
  platform: {
    type: String,
    enum: ["majsoul", "tenhou", "riichiCity", "IRL"],
    required: true,
  },
  rules: {
    type: String,
    enum: ["EMA", "WRC", "ONLINE", "MLEAGUE"],
    required: true,
  },
  context: {
    type: String,
    required: true,
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: false },
  results: { type: [resultSchema], required: true },
  log: { type: String, required: false },
  league: { type: mongoose.Schema.Types.ObjectId, required: false },
});

export const Game = mongoose.model("Game", gameSchema);
