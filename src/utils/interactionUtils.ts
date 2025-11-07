import {
  ChatInputCommandInteraction,
  InteractionReplyOptions,
} from "discord.js";

export async function replyWithDelay(
  interaction: ChatInputCommandInteraction,
  options: InteractionReplyOptions,
  execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>
) {
  await interaction.reply({ ...options, content: "Mmmh..." });
  return execute(interaction);
}
