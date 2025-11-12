import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { invariantResources } from "../../resources/localization/strings";

export const data = new SlashCommandBuilder()
  .setDescription(invariantResources.commands.ping.desc)
  .setName(invariantResources.commands.ping.name);

export async function execute(itr: ChatInputCommandInteraction) {
  const response = await itr.reply({
    content: "pong!",
    withResponse: true,
  });
  const alwaysPass = () => true;

  const collector = response.resource?.message?.createReactionCollector({
    dispose: true,
  });

  collector?.on("collect", async (reaction, user) => {
    itr.editReply({ content: "+ " + reaction.emoji.name });
    console.log("collected");
  });
  collector?.on("remove", async (reaction, user) => {
    itr.editReply({ content: "- " + reaction.emoji.name });
    console.log("removed");
  });
  collector?.on("end", async (collected, reason) => {
    console.log(`ended: ${reason}`);
  });
}
