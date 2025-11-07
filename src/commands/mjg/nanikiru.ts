import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  Locale,
} from "discord.js";
import { getImageFromTiles } from "../../mahjong/imageUtils";
import {
  invariantLocale,
  NameDesc,
  strings,
} from "../../resources/localization/strings";
import { getHandEmojiNames, toHandToDisplay } from "../../mahjong/handParser";
import { localize } from "../../utils/localizationUtils";
import { stringFormat } from "../../utils/stringUtils";

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

export const nanikiruOptions = {
  hand: strings.commands.mjg.nanikiru.params.hand,
  discards: strings.commands.mjg.nanikiru.params.discards,
  doras: strings.commands.mjg.nanikiru.params.doras,
  seat: strings.commands.mjg.nanikiru.params.seat,
  round: strings.commands.mjg.nanikiru.params.round,
  turn: strings.commands.mjg.nanikiru.params.turn,
  ukeire: strings.commands.mjg.nanikiru.params.ukeire,
  thread: strings.commands.mjg.nanikiru.params.thread,
};

function name(path: NameDesc) {
  return localize(invariantLocale, path.name);
}

function buildText(
  seat: string | null,
  round: string | null,
  turn: string | null,
  doras: string | null,
  locale: Locale
) {
  const replyStrings = strings.commands.mjg.nanikiru.reply;
  const sb = [];
  const wwyd = localize(locale, replyStrings.wwyd) + "\n";
  sb.push(seat && stringFormat(locale, replyStrings.seat, seat));
  sb.push(round && stringFormat(locale, replyStrings.round, round));
  sb.push(turn && stringFormat(locale, replyStrings.turn, turn));
  sb.push(doras && stringFormat(locale, replyStrings.doras, doras));
  return wwyd + sb.join(" | ") + "\n";
}

export async function executeNanikiru(itr: ChatInputCommandInteraction) {
  const hand = itr.options.getString(name(nanikiruOptions.hand), true);
  const discards = itr.options.getString(name(nanikiruOptions.discards), false);
  const doras = itr.options.getString(name(nanikiruOptions.doras), false);
  const seat = itr.options.getString(name(nanikiruOptions.seat), false);
  const round = itr.options.getString(name(nanikiruOptions.round), false);
  const turn = itr.options.getString(name(nanikiruOptions.turn), false);
  const ukeire = itr.options.getString(name(nanikiruOptions.ukeire), false);
  const thread = itr.options.getBoolean(name(nanikiruOptions.thread), false);

  const replyMessage = buildText(seat, round, turn, doras, itr.locale);

  const toDisplay = toHandToDisplay(hand);
  const image = await getImageFromTiles(toDisplay);
  const ab = new AttachmentBuilder(image);

  const emojis = getHandEmojiNames({
    hand: discards || toDisplay.closedTiles,
    sorted: true,
    unique: true,
  });

  return itr
    .editReply({
      content: replyMessage,
      files: [{ attachment: ab.attachment }],
    })
    .then((message) => {
      itr.client.application.emojis.fetch().then((appEmojiList) => {
        emojis.forEach(async (emoji) => {
          const appEmoji = appEmojiList.find((appEmo) => appEmo.name === emoji);
          if (appEmoji) {
            await message.react(appEmoji.identifier);
          }
        });
      });
    });
}
