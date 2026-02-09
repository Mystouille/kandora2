import mongoose from "mongoose";
import { config } from "../config";
import { TeamModel } from "../db/Team";
import { teamRoles } from "../resources/leagueData/roles";

async function updateTeamRoles() {
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to MongoDB");

  for (const role of teamRoles) {
    if (!role.teamName) continue;

    const result = await TeamModel.updateMany(
      { simpleName: role.teamName },
      { $set: { roleId: role.roleId } }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `Updated ${result.modifiedCount} team(s) for ${role.teamName} with roleId ${role.roleId}`
      );
    } else if (result.matchedCount === 0) {
      console.log(`No team found with simpleName: ${role.teamName}`);
    } else {
      console.log(`Team ${role.teamName} already has correct roleId`);
    }
  }

  console.log("Done updating team roles");
  await mongoose.disconnect();
  process.exit(0);
}

updateTeamRoles().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
