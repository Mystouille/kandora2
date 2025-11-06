import {
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  InteractionResponse,
} from "discord.js";

export async function replyWithDelay(
  interaction: ChatInputCommandInteraction,
  options: InteractionReplyOptions,
  execute: (
    interaction: ChatInputCommandInteraction
  ) => Promise<InteractionResponse<boolean>>
) {
  await interaction.reply({ ...options, content: "Pending reply..." });
  return execute(interaction);
}
