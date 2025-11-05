import { loadImage } from "canvas";
import { ChatInputCommandInteraction } from "discord.js";

export async function executeNanikiru(
  interaction: ChatInputCommandInteraction,
): Promise<any> {
  const a = interaction.client.emojis.valueOf();
  const b = interaction.client.emojis.valueOf().get("refresh");
  const image = await loadImage("resources/tiles/tiles.png");
  image.height;

  return interaction.editReply({
    content: ` ${image.height} :grapes:${interaction.client.emojis.valueOf().find((x) => x.name === "refresh")}:1s:`,
  });
}
