import mongoose from "mongoose";
import { config } from "../config";
import { UserModel } from "../db/User";
import { TeamModel } from "../db/Team";
import { LeagueConfig, LeagueModel } from "../db/League";
import { BracketModel } from "../db/Bracket";

/**
 * CSV data for LFCR 2026 Finals rosters.
 * Each entry: team display name, seed, P1-P4 (members), S1-S2 (substitutes).
 * Players formatted as "name — friendId".
 */
const teamsData = [
  {
    displayName: "Paris (TNT)",
    simpleName: "Paris",
    seed: 8,
    members: [
      { name: "Shiraha", friendId: "111581038" },
      { name: "Rorofy", friendId: "84938218" },
      { name: "Neral", friendId: "125168357" },
      { name: "Dubrissaud", friendId: "114028782" },
    ],
    substitutes: [
      { name: "alexapin", friendId: "120273518" },
      { name: "Tinecro", friendId: "124792046" },
    ],
  },
  {
    displayName: "Bordeaux (FYA)",
    simpleName: "Bordeaux",
    seed: 9,
    members: [
      { name: "makoas", friendId: "114708078" },
      { name: "arrcival", friendId: "114033006" },
      { name: "anthonys01", friendId: "122464485" },
      { name: "echobrainsert", friendId: "97298537" },
    ],
    substitutes: [
      { name: ".muguette", friendId: "111670887" },
      { name: "altaise", friendId: "112284005" },
    ],
  },
  {
    displayName: "Mulhouse (FD)",
    simpleName: "Mulhouse",
    seed: 10,
    members: [
      { name: "Callisto", friendId: "119870958" },
      { name: "Yūrei", friendId: "117672814" },
      { name: "Ina", friendId: "89507942" },
      { name: "fingerdash", friendId: "122277351" },
    ],
    substitutes: [
      { name: "Raphaël K", friendId: "89527914" },
      { name: "Shosu", friendId: "84260965" },
    ],
  },
  {
    displayName: "Bourgoin (RON)",
    simpleName: "Bourgoin",
    seed: 7,
    members: [
      { name: "yothisismahjong", friendId: "127171433" },
      { name: "sangluten", friendId: "110305379" },
      { name: "valkyrja3272", friendId: "133595111" },
      { name: "thereed", friendId: "139758306" },
    ],
    substitutes: [
      { name: "goodlove6020", friendId: "102703203" },
      { name: "greenfenix", friendId: "122928099" },
    ],
  },
  {
    displayName: "Évry (EVR)",
    simpleName: "Évry",
    seed: 1,
    members: [
      { name: "tlasez", friendId: "133870434" },
      { name: "phokopi", friendId: "119439982" },
      { name: "sileney", friendId: "100752739" },
      { name: "yossuze", friendId: "132987751" },
    ],
    substitutes: [
      { name: "procop.", friendId: "90248037" },
      { name: "alfouick", friendId: "93897827" },
    ],
  },
  {
    displayName: "Villejuif (FDO)",
    simpleName: "Villejuif",
    seed: 4,
    members: [
      { name: "cedric9575", friendId: "126875365" },
      { name: "gabrieldes", friendId: "113446117" },
      { name: "annso1212", friendId: "81775082" },
      { name: "Marionpapillon", friendId: "89752172" },
    ],
    substitutes: [
      { name: "Saiming", friendId: "114613358" },
      { name: "caroxiaojiecaroline", friendId: "115754350" },
    ],
  },
  {
    displayName: "Angers (SHA)",
    simpleName: "Angers",
    seed: 3,
    members: [
      { name: "lunebleue22", friendId: "113327470" },
      { name: "scratchy49", friendId: "123267822" },
      { name: "arbogad", friendId: "125146857" },
      { name: "bagdor", friendId: "98391017" },
    ],
    substitutes: [
      { name: "patricia_4976", friendId: "111931241" },
      { name: "loriog", friendId: "125348329" },
    ],
  },
  {
    displayName: "La Réunion (MJS)",
    simpleName: "La Réunion",
    seed: 12,
    members: [
      { name: "totoro4", friendId: "119193449" },
      { name: "shlikam", friendId: "102261345" },
      { name: "lilliejinx", friendId: "82062054" },
      { name: "mariamahjong", friendId: "91831916" },
    ],
    substitutes: [
      { name: "kairy3501", friendId: "81886694" },
      { name: "flk97450", friendId: "82062054" },
    ],
  },
  {
    displayName: "Union RNP (WCR)",
    simpleName: "Union RNP",
    seed: 6,
    members: [
      { name: "melia.azedarach", friendId: "117676005" },
      { name: "renlybara", friendId: "119370606" },
      { name: "mt_petitbleu", friendId: "91417834" },
      { name: "neilfrize", friendId: "140862946" },
    ],
    substitutes: [
      { name: "aliuqa", friendId: "111011174" },
      { name: "felix01284", friendId: "97754849" },
    ],
  },
  {
    displayName: "Lille (LVDM)",
    simpleName: "Lille",
    seed: 11,
    members: [
      { name: "Fukurou", friendId: "78368618" },
      { name: "Liccelso", friendId: "12291231" },
      { name: "Asriel", friendId: "78294116" },
      { name: "Léo", friendId: "127201381" },
    ],
    substitutes: [
      { name: "Hawat", friendId: "125119205" },
      { name: "Hugo", friendId: "106520033" },
    ],
  },
  {
    displayName: "Toulouse (SM)",
    simpleName: "Toulouse",
    seed: 5,
    members: [
      { name: "Geroth", friendId: "122939630" },
      { name: "Niko", friendId: "90935781" },
      { name: "Anh", friendId: "144042215" },
      { name: "Karten", friendId: "131417954" },
    ],
    substitutes: [
      { name: "Aliangel", friendId: "112751595" },
      { name: "Myrtille", friendId: "85138918" },
    ],
  },
  {
    displayName: "Cannes (SCT)",
    simpleName: "Cannes",
    seed: 2,
    members: [
      { name: "shinki.", friendId: "117673198" },
      { name: "zzimi_here", friendId: "123438318" },
      { name: "n7rizmo", friendId: "123087470" },
      { name: "dapiepiece", friendId: "123017961" },
    ],
    substitutes: [
      { name: "dranato", friendId: "123903587" },
      { name: "gorillaextract", friendId: "115616878" },
    ],
  },
];

async function findOrCreateUser(player: {
  name: string;
  friendId: string;
}): Promise<mongoose.Types.ObjectId> {
  // Look up by Majsoul friendId
  let user = await UserModel.findOne({
    "majsoulIdentity.friendId": player.friendId,
  }).exec();

  if (user) {
    console.log(
      `  Found existing user: ${user.name ?? user.majsoulIdentity?.name} (friendId: ${player.friendId})`
    );
    return user._id;
  }

  // Create new user
  user = await UserModel.create({
    name: player.name,
    majsoulIdentity: {
      friendId: player.friendId,
      name: player.name,
    },
  });
  console.log(
    `  Created new user: ${player.name} (friendId: ${player.friendId})`
  );
  return user._id;
}

async function main() {
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to MongoDB");

  // 1. Find the LFCR_FINAL league
  let league = await LeagueModel.findOne({
    configuration: LeagueConfig.LFCR_FINAL,
    isOngoing: true,
  }).exec();

  if (!league) {
    // Fallback: find any LFCR_FINAL league
    league = await LeagueModel.findOne({
      configuration: LeagueConfig.LFCR_FINAL,
    }).exec();
  }

  if (!league) {
    console.error(
      "No league with configuration LFCR_FINAL found. Please create the league first."
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Using league: "${league.name}" (${league._id})`);

  // 2. Process each team
  const seedings: { seed: number; teamId: mongoose.Types.ObjectId }[] = [];

  for (const teamData of teamsData) {
    console.log(
      `\nProcessing team: ${teamData.displayName} (seed ${teamData.seed})`
    );

    // Find or create all members
    const memberIds: mongoose.Types.ObjectId[] = [];
    for (const player of teamData.members) {
      const userId = await findOrCreateUser(player);
      memberIds.push(userId);
    }

    // Find or create all substitutes
    const substituteIds: mongoose.Types.ObjectId[] = [];
    for (const player of teamData.substitutes) {
      const userId = await findOrCreateUser(player);
      // Avoid duplicates (e.g. same friendId appearing as member and substitute)
      if (
        !memberIds.some((id) => id.equals(userId)) &&
        !substituteIds.some((id) => id.equals(userId))
      ) {
        substituteIds.push(userId);
      } else if (substituteIds.some((id) => id.equals(userId))) {
        console.log(
          `  ⚠ Skipping duplicate substitute: ${player.name} (${player.friendId})`
        );
      }
    }

    // Check if team already exists for this league
    let team = await TeamModel.findOne({
      simpleName: teamData.simpleName,
      leagueId: league._id,
    }).exec();

    if (team) {
      console.log(
        `  Team "${teamData.displayName}" already exists, updating members...`
      );
      await TeamModel.updateOne(
        { _id: team._id },
        {
          displayName: teamData.displayName,
          captain: memberIds[0],
          members: memberIds,
          substitutes: substituteIds,
        }
      ).exec();
    } else {
      team = await TeamModel.create({
        simpleName: teamData.simpleName,
        displayName: teamData.displayName,
        leagueId: league._id,
        captain: memberIds[0],
        members: memberIds,
        substitutes: substituteIds,
      });
      console.log(`  Created team: ${teamData.displayName}`);
    }

    seedings.push({
      seed: teamData.seed,
      teamId: team._id as mongoose.Types.ObjectId,
    });
  }

  // 3. Create bracket
  console.log("\nSetting up bracket...");
  const existingBracket = await BracketModel.findOne({
    league: league._id,
  }).exec();

  if (existingBracket) {
    console.log("Bracket already exists, updating seedings...");
    await BracketModel.updateOne(
      { _id: existingBracket._id },
      { seedings }
    ).exec();
  } else {
    await BracketModel.create({
      league: league._id,
      seedings,
    });
    console.log("Created bracket with seedings.");
  }

  // Summary
  console.log("\n=== Summary ===");
  console.log(`League: ${league.name}`);
  console.log(`Teams created/updated: ${teamsData.length}`);
  console.log("Seedings:");
  for (const s of seedings.sort((a, b) => a.seed - b.seed)) {
    const teamData = teamsData.find((t) => t.seed === s.seed);
    console.log(`  #${s.seed} - ${teamData?.displayName}`);
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
