import { Locale } from "discord.js";
import { stringsFr } from "./strings-fr";
import { stringsEn } from "./strings-en";

export type NameDesc = {
  name: string;
  desc: string;
};

export const strings = {
  commands: {
    ping: {
      name: "commands.ping.name",
      desc: "commands.ping.description",
    },
    createuser: {
      name: "commands.createuser.name",
      desc: "commands.createuser.desc",
    },
    quizz: {
      name: "commands.quizz.name",
      common: {
        reply: {
          timerDisclaimerFormat:
            "commands.quizz.common.reply.timerDisclaimerFormat",
          openingMessageExploreFormat:
            "commands.quizz.common.reply.openingMessageExploreFormat",
          openingMessageFirstFormat:
            "commands.quizz.common.reply.openingMessageFirstFormat",
          openingMessageRaceFormat:
            "commands.quizz.common.reply.openingMessageRaceFormat",
          problemIsLoading: "commands.quizz.common.reply.problemIsLoading",
          timeoutNoWinnerReply:
            "commands.quizz.common.reply.timeoutNoWinnerReply",
          firstWinnerMessageFormat:
            "commands.quizz.common.reply.firstWinnerMessageFormat",
          roundOver: "commands.quizz.nanikiru.reply.roundOver",
          winnerFormat: "commands.quizz.nanikiru.reply.winnerFormat",
          loserFormat: "commands.quizz.nanikiru.reply.loserFormat",
        },
      },
      nanikiru: {
        name: "commands.quizz.nanikiru.name",
        desc: "commands.quizz.nanikiru.desc",
        params: {
          nbRounds: {
            name: "commands.quizz.nanikiru.params.nbRounds.name",
            desc: "commands.quizz.nanikiru.params.nbRounds.desc",
          },
          mode: {
            name: "commands.quizz.nanikiru.params.mode.name",
            desc: "commands.quizz.nanikiru.params.mode.desc",
            options: {
              first: "commands.quizz.nanikiru.params.mode.options.first",
              race: "commands.quizz.nanikiru.params.mode.options.race",
              explore: "commands.quizz.nanikiru.params.mode.options.explore",
            },
          },
          series: {
            name: "commands.quizz.nanikiru.params.series.name",
            desc: "commands.quizz.nanikiru.params.series.desc",
            options: {
              uzaku301:
                "commands.quizz.nanikiru.params.series.options.uzaku300",
              uzakuKin:
                "commands.quizz.nanikiru.params.series.options.uzakuKin",
            },
          },
        },
        reply: {
          theadNameFormat: "commands.quizz.nanikiru.reply.theadNameFormat",
          threadFirstMessageFormat:
            "commands.quizz.nanikiru.reply.threadFirstMessageFormat",
          openingMessage: "commands.quizz.nanikiru.reply.openingMessage",
          answerLabel: "commands.quizz.nanikiru.reply.answerLabel",
        },
      },
    },
    mjg: {
      name: "commands.mjg.name",
      nanikiru: {
        name: "commands.mjg.nanikiru.name",
        desc: "commands.mjg.nanikiru.desc",
        params: {
          hand: {
            name: "commands.mjg.nanikiru.params.hand.name",
            desc: "commands.mjg.nanikiru.params.hand.desc",
          },
          discards: {
            name: "commands.mjg.nanikiru.params.discards.name",
            desc: "commands.mjg.nanikiru.params.discards.desc",
          },
          doras: {
            name: "commands.mjg.nanikiru.params.doras.name",
            desc: "commands.mjg.nanikiru.params.doras.desc",
          },
          seat: {
            name: "commands.mjg.nanikiru.params.seat.name",
            desc: "commands.mjg.nanikiru.params.seat.desc",
            options: {
              east: "commands.mjg.nanikiru.params.seat.options.east",
              south: "commands.mjg.nanikiru.params.seat.options.south",
              west: "commands.mjg.nanikiru.params.seat.options.west",
              north: "commands.mjg.nanikiru.params.seat.params.north",
            },
          },
          round: {
            name: "commands.mjg.nanikiru.params.round.name",
            desc: "commands.mjg.nanikiru.params.round.desc",
          },
          turn: {
            name: "commands.mjg.nanikiru.params.turn.name",
            desc: "commands.mjg.nanikiru.params.turn.desc",
          },
          thread: {
            name: "commands.mjg.nanikiru.params.thread.name",
            desc: "commands.mjg.nanikiru.params.thread.desc",
          },
          ukeire: {
            name: "commands.mjg.nanikiru.params.ukeire.name",
            desc: "commands.mjg.nanikiru.params.ukeire.desc",
            options: {
              no: "commands.mjg.nanikiru.params.ukeire.options.no",
              yes: "commands.mjg.nanikiru.params.ukeire.options.yes",
              full: "commands.mjg.nanikiru.params.ukeire.options.full",
            },
          },
        },
        reply: {
          seat: "commands.mjg.nanikiru.reply.seat",
          round: "commands.mjg.nanikiru.reply.round",
          turn: "commands.mjg.nanikiru.reply.turn",
          doras: "commands.mjg.nanikiru.reply.doras",
          wwyd: "commands.mjg.nanikiru.reply.wwyd",
          threadTitle: "commands.mjg.nanikiru.reply.threadTitle",
        },
      },
    },
  },
};

export type StringResources = typeof strings;

export const invariantLocale = Locale.EnglishUS;
export const invariantResources = stringsEn;
export const resourceMap: { [id in Locale]?: StringResources } = {
  [Locale.French]: stringsFr,
  [Locale.EnglishUS]: stringsEn,
  [Locale.EnglishGB]: stringsEn,
};
