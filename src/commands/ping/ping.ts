import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { invariantResources } from "../../resources/localization/strings";

export const data = new SlashCommandBuilder()
  .setDescription(invariantResources.commands.ping.desc)
  .setName(invariantResources.commands.ping.name);

export async function execute(itr: ChatInputCommandInteraction) {
  const a = itr.client.emojis.valueOf();
  const b = itr.client.emojis.valueOf().get("refresh");

  itr.reply({
    content: "pong!",
    withResponse: true,
  });
}
