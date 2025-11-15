import {
  AllowedThreadTypeForTextChannel,
  ChannelType,
  ChatInputCommandInteraction,
  GuildTextThreadManager,
  InteractionCallbackResponse,
  Locale,
  ThreadAutoArchiveDuration,
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
} from "../../mahjong/handParser";
import { localize } from "../../utils/localizationUtils";
import { stringFormat } from "../../utils/stringUtils";
import {
  getShantenInfo,
  getHairi,
  Hairi,
  UkeireChoice,
} from "../../mahjong/shantenUtils";
import * as shantenCalc from "syanten";
import { fromStrToTile9997 } from "../../mahjong/handConverter";

export async function executeNanikiru(
  itr: ChatInputCommandInteraction,
  response: InteractionCallbackResponse<boolean>
) {
  const thread = itr.options.getBoolean(
    optionName(nanikiruOptions.thread),
    false
  );

  if (thread && itr.channel?.type === ChannelType.GuildText) {
    replyInThread(itr, response, itr.channel.threads);
  } else {
    replyInSitu(itr, response);
  }
}

export enum SeatChoice {
  East = "East",
  South = "South",
  West = "West",
  North = "North",
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

function optionName(path: NameDesc) {
  return localize(invariantLocale, path.name);
}

function replyInSitu(
  itr: ChatInputCommandInteraction,
  response: InteractionCallbackResponse<boolean>
) {
  const hand = itr.options.getString(optionName(nanikiruOptions.hand), true);
  const discards = itr.options.getString(
    optionName(nanikiruOptions.discards),
    false
  );
  const doras = itr.options.getString(optionName(nanikiruOptions.doras), false);
  const seat = itr.options.getString(optionName(nanikiruOptions.seat), false);
  const round = itr.options.getString(optionName(nanikiruOptions.round), false);
  const turn = itr.options.getString(optionName(nanikiruOptions.turn), false);
  const ukeireChoice = itr.options.getString(
    optionName(nanikiruOptions.ukeire),
    false
  ) as UkeireChoice;
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

  itr.editReply({
    content:
      replyMessage +
      "\n" +
      getShantenInfo(hand, ukeireChoice, itr.locale, discards || undefined),
  });
}

function replyInThread(
  itr: ChatInputCommandInteraction,
  response: InteractionCallbackResponse<boolean>,
  threadManager: GuildTextThreadManager<AllowedThreadTypeForTextChannel>
) {
  const hand = itr.options.getString(optionName(nanikiruOptions.hand), true);
  const discards = itr.options.getString(
    optionName(nanikiruOptions.discards),
    false
  );
  const doras = itr.options.getString(optionName(nanikiruOptions.doras), false);
  const seat = itr.options.getString(optionName(nanikiruOptions.seat), false);
  const round = itr.options.getString(optionName(nanikiruOptions.round), false);
  const turn = itr.options.getString(optionName(nanikiruOptions.turn), false);
  const ukeireChoice = itr.options.getString(
    optionName(nanikiruOptions.ukeire),
    false
  ) as UkeireChoice;

  const replyMessage = buildText(seat, round, turn, doras, itr.locale);
  itr.editReply({
    content: replyMessage,
  });

  const toDisplay = fromStrToHandToDisplay(hand);
  getImageFromTiles(toDisplay)
    .then((image) => itr.editReply({ files: [image] }))
    .then(() => {
      threadManager
        .create({
          name: stringFormat(
            itr.locale,
            strings.commands.mjg.nanikiru.reply.threadTitle,
            itr.member?.user.username || "",
            hand
          ),
          autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
          startMessage: response.resource?.message?.id,
          type: 11,
        })
        .then((thread) => {
          thread
            .send({
              content: getShantenInfo(hand, ukeireChoice, itr.locale),
            })
            .then((message) => {
              const emojis = getHandEmojis({
                hand: discards || toDisplay.closedTiles,
                sorted: true,
                unique: true,
              });

              emojis.forEach(async (emoji) => {
                message.react(emoji);
              });
            });
        });
    });
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
