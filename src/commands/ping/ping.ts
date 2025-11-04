import {
  CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { stringsEn } from "../../resources/localization/strings-en";

export const data = new SlashCommandBuilder()
  .setDescription(stringsEn.commands.ping.desc)
  .setName(stringsEn.commands.ping.name);

export async function execute(interaction: CommandInteraction) {
  return interaction.reply({ content: "pong!", flags: MessageFlags.Ephemeral });
}
