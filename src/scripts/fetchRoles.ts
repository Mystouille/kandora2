import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config";
import * as fs from "fs";

async function fetchRoles() {
  const guild = await client.guilds.fetch(config.DISCORD_GUILD_ID);
  const roles = await guild.roles.fetch();

  const roleList = roles.map((role) => ({
    roleName: role.name,
    roleId: role.id,
  }));

  // Sort by position (highest first, like in Discord UI)
  roleList.sort((a, b) => {
    const roleA = roles.get(a.roleId);
    const roleB = roles.get(b.roleId);
    return (roleB?.position ?? 0) - (roleA?.position ?? 0);
  });

  const outputPath = "./src/resources/leagueData/roles.json";
  fs.writeFileSync(outputPath, JSON.stringify(roleList, null, 2));
  console.log(`Saved ${roleList.length} roles to ${outputPath}`);

  client.destroy();
  process.exit(0);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  fetchRoles();
});
client.login(config.DISCORD_TOKEN);
