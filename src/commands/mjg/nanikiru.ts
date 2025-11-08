import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  InteractionCallbackResponse,
  InteractionResponse,
  Locale,
} from "discord.js";
import { getImageFromTiles } from "../../mahjong/imageUtils";
import {
  invariantLocale,
  NameDesc,
  strings,
} from "../../resources/localization/strings";
import {
  getHandEmojis,
  fromStrToHandToDisplay,
  splitTiles,
} from "../../mahjong/handParser";
import { localize } from "../../utils/localizationUtils";
import { stringFormat } from "../../utils/stringUtils";
import * as shantenCalc from "syanten";
import { fromStrToTile9997 } from "../../mahjong/handConverter";
import { getHairi, Hairi } from "../../mahjong/shanten";
import { AppEmojiCollection } from "../../resources/emojis/AppEmojiCollection";

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
  let sb = [];

  const doraEmojis =
    doras &&
    getHandEmojis({
      hand: doras,
      sorted: false,
      unique: true,
    }).join("");

  const wwyd = localize(locale, replyStrings.wwyd) + "\n";
  sb.push(seat && stringFormat(locale, replyStrings.seat, seat));
  sb.push(round && stringFormat(locale, replyStrings.round, round));
  sb.push(turn && stringFormat(locale, replyStrings.turn, turn));
  sb.push(doraEmojis && stringFormat(locale, replyStrings.doras, doraEmojis));
  sb = sb.filter((x) => !!x);
  return wwyd + sb.join(" | ");
}

function buildUkeireInfo(hairi: Hairi): string {
  let sb = [];
  sb.push(`${hairi.shanten}-shanten`);
  let hasAtLeastOneGoodTenpai = false;
  hairi.ukeire.forEach((discard) => {
    const tileEmoji = getHandEmojis({
      hand: discard.tile,
    });
    hasAtLeastOneGoodTenpai =
      hasAtLeastOneGoodTenpai || discard.nbGoodTenpaiWaits > 0;
    const goodWaitTenpaiInfo =
      discard.nbGoodTenpaiWaits > 0 ? `(${discard.nbGoodTenpaiWaits}\\*)` : "";
    const goodTenpaiDraws = discard.waits
      .filter((w) => w.goodTenpai)
      .map((w) => w.tile)
      .join("");
    const badTenpaiDraws = discard.waits
      .filter((w) => !w.goodTenpai)
      .map((w) => w.tile)
      .join("");
    const goodTenpaiEmojis = getHandEmojis({
      hand: goodTenpaiDraws,
      sorted: true,
      unique: true,
    }).join("");
    const goodMark = goodTenpaiEmojis.length > 0 ? "\\*" : "";
    const badTenpaiEmojis = getHandEmojis({
      hand: badTenpaiDraws,
      sorted: true,
      unique: true,
    }).join("");
    const waitStr = `${tileEmoji}:\t ${discard.nbTotalWaits}${goodWaitTenpaiInfo}[${goodTenpaiEmojis}${goodMark}${badTenpaiEmojis}]`;
    sb.push(waitStr);
  });
  if (hasAtLeastOneGoodTenpai) {
    sb.push("*:resulting in 5+ tile tenpai");
  }
  return sb.join("\n");
}

export async function executeNanikiru(
  itr: ChatInputCommandInteraction,
  response: InteractionCallbackResponse<boolean>
) {
  const hand = itr.options.getString(name(nanikiruOptions.hand), true);
  const discards = itr.options.getString(name(nanikiruOptions.discards), false);
  const doras = itr.options.getString(name(nanikiruOptions.doras), false);
  const seat = itr.options.getString(name(nanikiruOptions.seat), false);
  const round = itr.options.getString(name(nanikiruOptions.round), false);
  const turn = itr.options.getString(name(nanikiruOptions.turn), false);
  const ukeire = itr.options.getString(name(nanikiruOptions.ukeire), false);
  const thread = itr.options.getBoolean(name(nanikiruOptions.thread), false);

  const replyMessage = buildText(seat, round, turn, doras, itr.locale);
  itr.editReply({
    content: replyMessage,
  });

  const toDisplay = fromStrToHandToDisplay(hand);
  getImageFromTiles(toDisplay).then((image) =>
    itr.editReply({ files: [image] })
  );

  const emojis = getHandEmojis({
    hand: discards || toDisplay.closedTiles,
    sorted: true,
    unique: true,
  });
  emojis.forEach(async (emoji) => {
    response.resource?.message?.react(emoji);
  });

  Promise.resolve(getHairi(toDisplay.closedTiles)).then(async (handInfo) =>
    itr.editReply({ content: replyMessage + "\n" + buildUkeireInfo(handInfo) })
  );
}
