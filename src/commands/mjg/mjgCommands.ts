import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { replyWithDelay } from "../utils/interactionUtils";
import { executeNanikiru } from "./nanikiru";
import { strings } from "../../resources/localization/strings";
import { buildOptionNameAndDescription } from "../utils/localizationUtils";
import { stringsEn } from "../../resources/localization/strings-en";

export enum SeatChoice {
  East = "East",
  South = "South",
  West = "West",
  North = "North",
}
export enum UkeireChoice {
  No = "No",
  Yes = "Yes",
  Full = "Full",
}

const nanikiruSubCommandName = stringsEn.commands.mjg.nanikiru.name;

export let data: any = new SlashCommandBuilder()
  .setName(stringsEn.commands.mjg.name)
  .setDescription(stringsEn.commands.mjg.name)
  .addSubcommand((sub) =>
    buildOptionNameAndDescription(sub, strings.commands.mjg.nanikiru)
      .addStringOption((option) =>
        buildOptionNameAndDescription(
          option,
          strings.commands.mjg.nanikiru.params.hand,
        ).setRequired(true),
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(
          option,
          strings.commands.mjg.nanikiru.params.discards,
        ),
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(
          option,
          strings.commands.mjg.nanikiru.params.doras,
        ),
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(
          option,
          strings.commands.mjg.nanikiru.params.seat,
        )
          .addChoices([
            {
              name: stringsEn.commands.mjg.nanikiru.params.seat.options.east,
              value: SeatChoice.East,
            },
            {
              name: stringsEn.commands.mjg.nanikiru.params.seat.options.south,
              value: SeatChoice.South,
            },
            {
              name: stringsEn.commands.mjg.nanikiru.params.seat.options.west,
              value: SeatChoice.West,
            },
            {
              name: stringsEn.commands.mjg.nanikiru.params.seat.options.north,
              value: SeatChoice.North,
            },
          ])
          .setRequired(false),
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(
          option,
          strings.commands.mjg.nanikiru.params.round,
        ),
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(
          option,
          strings.commands.mjg.nanikiru.params.turn,
        ),
      )
      .addStringOption((option) =>
        buildOptionNameAndDescription(
          option,
          strings.commands.mjg.nanikiru.params.ukeire,
        )
          .addChoices([
            {
              name: stringsEn.commands.mjg.nanikiru.params.ukeire.options.no,
              value: UkeireChoice.No,
            },
            {
              name: stringsEn.commands.mjg.nanikiru.params.ukeire.options.yes,
              value: UkeireChoice.Yes,
            },
            {
              name: stringsEn.commands.mjg.nanikiru.params.ukeire.options.full,
              value: UkeireChoice.Full,
            },
          ])
          .setRequired(false),
      )
      .addBooleanOption((option) =>
        buildOptionNameAndDescription(
          option,
          strings.commands.mjg.nanikiru.params.thread,
        ),
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.options.getSubcommand() === nanikiruSubCommandName) {
    await replyWithDelay(interaction, { flags: "Ephemeral" }, executeNanikiru);
  }
}
