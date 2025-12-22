import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;

const leagueGameMessageSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  league: { type: ObjectId, required: true },
  gameId: { type: String, required: true },
  players: [
    {
      type: ObjectId,
      required: true,
      default: [],
    },
  ],
});

export const LeagueGameMessage = mongoose.model(
  "LeagueGameMessage",
  leagueGameMessageSchema
);
