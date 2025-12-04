import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  simpleName: { type: String, required: true },
  displayName: { type: String, required: true },
  leagueId: { type: mongoose.Schema.Types.ObjectId, required: true },
  captain: { type: mongoose.Schema.Types.ObjectId, required: true },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      default: [],
    },
  ],
});

export const Team = mongoose.model("Team", teamSchema);
