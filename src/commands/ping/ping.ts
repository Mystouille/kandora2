import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { invariantResources } from "../../resources/localization/strings";
import { fromStrToTile9997 } from "../../mahjong/handConverter";
import * as shantenCalc from "syanten";

export const data = new SlashCommandBuilder()
  .setDescription(invariantResources.commands.ping.desc)
  .setName(invariantResources.commands.ping.name);

export async function execute(itr: ChatInputCommandInteraction) {
  const response = await itr.reply({
    content: "pong!",
    withResponse: true,
  });
  const alwaysPass = () => true;

  const hand = fromStrToTile9997("235667m34467p05s6m");
  const bla = shantenCalc.syantenAll(hand);
  console.log(bla);
}
