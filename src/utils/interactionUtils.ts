import {
  ChatInputCommandInteraction,
  InteractionCallbackResponse,
  InteractionReplyOptions,
} from "discord.js";

export async function replyWithDelay(
  interaction: ChatInputCommandInteraction,
  options: InteractionReplyOptions,
  execute: (
    interaction: ChatInputCommandInteraction,
    response: InteractionCallbackResponse<boolean>
  ) => Promise<unknown>
) {
  interaction
    .deferReply({ ...options })
    .then((response) => execute(interaction, response));
}
