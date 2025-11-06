import { ChatInputCommandInteraction } from "discord.js";

export async function executeNanikiru(
  interaction: ChatInputCommandInteraction
): Promise<unknown> {
  const a = interaction.client.emojis.valueOf();
  const b = interaction.client.emojis.valueOf().get("refresh");

  return interaction.editReply({
    content: `:grapes:${interaction.client.emojis.valueOf().find((x) => x.name === "refresh")}:1s:`,
  });
}
