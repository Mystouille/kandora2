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
    .reply({ ...options, content: "Mmmh...", withResponse: true })
    .then((response) => execute(interaction, response));
}
