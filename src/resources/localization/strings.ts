import { Locale } from "discord.js";
import { stringsFr } from "./strings-fr";
import { stringsEn } from "./strings-en";

export type NameDesc = {
  name: string;
  desc: string;
};

export const strings = {
  commands: {
    common: {
      shantenGoodWaitInfo: "commands.common.shantenGoodWaitInfo",
    },
    ping: {
      name: "commands.ping.name",
      desc: "commands.ping.description",
    },
    admin: {
      name: "commands.admin.name",
      desc: "commands.admin.desc",
      checkNanikiru: {
        name: "commands.admin.checkNanikiru.name",
        desc: "commands.admin.checkNanikiru.desc",
        params: {
          id: {
            name: "commands.admin.checkNanikiru.params.id.name",
            desc: "commands.admin.checkNanikiru.params.id.desc",
          },
        },
      },
    },
    createuser: {
      name: "commands.createuser.name",
      desc: "commands.createuser.desc",
    },
    quiz: {
      name: "commands.quiz.name",
      common: {
        params: {
          nbrounds: {
            name: "commands.quiz.common.params.nbrounds.name",
            desc: "commands.quiz.common.params.nbrounds.desc",
          },
          mode: {
            name: "commands.quiz.common.params.mode.name",
            desc: "commands.quiz.common.params.mode.desc",
            options: {
              first: "commands.quiz.common.params.mode.options.first",
              race: "commands.quiz.common.params.mode.options.race",
              explore: "commands.quiz.common.params.mode.options.explore",
            },
          },
          timeout: {
            name: "commands.quiz.common.params.timeout.name",
            desc: "commands.quiz.common.params.timeout.desc",
          },
        },
        reply: {
          timerDisclaimerFormat:
            "commands.quiz.common.reply.timerDisclaimerFormat",
          openingMessageExploreFormat:
            "commands.quiz.common.reply.openingMessageExploreFormat",
          openingMessageFirstFormat:
            "commands.quiz.common.reply.openingMessageFirstFormat",
          openingMessageRaceFormat:
            "commands.quiz.common.reply.openingMessageRaceFormat",
          problemIsLoading: "commands.quiz.common.reply.problemIsLoading",
          timeoutNoWinnerReply:
            "commands.quiz.common.reply.timeoutNoWinnerReply",
          firstWinnerMessageFormat:
            "commands.quiz.common.reply.firstWinnerMessageFormat",
          roundOver: "commands.quiz.common.reply.roundOver",
          winnerFormat: "commands.quiz.common.reply.winnerFormat",
          loserFormat: "commands.quiz.common.reply.loserFormat",
          continueQuizPrompt: "commands.quiz.common.reply.continueQuizPrompt",
          quizIsOver: "commands.quiz.common.reply.quizIsOver",
        },
      },
      nanikiru: {
        name: "commands.quiz.nanikiru.name",
        desc: "commands.quiz.nanikiru.desc",
        params: {
          series: {
            name: "commands.quiz.nanikiru.params.series.name",
            desc: "commands.quiz.nanikiru.params.series.desc",
            options: {
              uzaku301: "commands.quiz.nanikiru.params.series.options.uzaku300",
              uzakuKin: "commands.quiz.nanikiru.params.series.options.uzakuKin",
            },
          },
        },
        reply: {
          theadNameFormat: "commands.quiz.nanikiru.reply.theadNameFormat",
          threadFirstMessageFormat:
            "commands.quiz.nanikiru.reply.threadFirstMessageFormat",
          defaultOpeningMessage:
            "commands.quiz.nanikiru.reply.defaultOpeningMessage",
          answerLabel: "commands.quiz.nanikiru.reply.answerLabel",
        },
      },
      chinitsu: {
        name: "commands.quiz.chinitsu.name",
        desc: "commands.quiz.chinitsu.desc",
        params: {
          suit: {
            name: "commands.quiz.chinitsu.params.suit.name",
            desc: "commands.quiz.chinitsu.params.suit.desc",
            options: {
              pinzu: "commands.quiz.chinitsu.params.suit.options.pinzu",
              manzu: "commands.quiz.chinitsu.params.suit.options.manzu",
              souzu: "commands.quiz.chinitsu.params.suit.options.souzu",
            },
          },
          difficulty: {
            name: "commands.quiz.chinitsu.params.difficulty.name",
            desc: "commands.quiz.chinitsu.params.difficulty.desc",
            options: {
              easy: "commands.quiz.chinitsu.params.difficulty.options.easy",
              normal: "commands.quiz.chinitsu.params.difficulty.options.normal",
              hard: "commands.quiz.chinitsu.params.difficulty.options.hard",
            },
          },
        },
        reply: {
          theadNameFormat: "commands.quiz.chinitsu.reply.theadNameFormat",
          threadFirstMessageFormat:
            "commands.quiz.chinitsu.reply.threadFirstMessageFormat",
          openingMessage: "commands.quiz.chinitsu.reply.openingMessage",
          answerLabel: "commands.quiz.chinitsu.reply.answerLabel",
        },
      },
    },
    myinfo: {
      name: "commands.myinfo.name",
      update: {
        name: "commands.myinfo.update.name",
        desc: "commands.myinfo.update.desc",
      },
      delete: {
        name: "commands.myinfo.delete.name",
        desc: "commands.myinfo.delete.desc",
        reply: {
          noDataToDelete: "commands.myinfo.delete.reply.noDataToDelete",
          modalTitle: "commands.myinfo.delete.reply.modalTitle",
          confirmationMessage:
            "commands.myinfo.delete.reply.confirmationMessage",
          usernameLabel: "commands.myinfo.delete.reply.usernameLabel",
          usernamePlaceholder:
            "commands.myinfo.delete.reply.usernamePlaceholder",
          userNotFound: "commands.myinfo.delete.reply.userNotFound",
          successMessage: "commands.myinfo.delete.reply.successMessage",
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
          spoiler: {
            name: "commands.mjg.nanikiru.params.spoiler.name",
            desc: "commands.mjg.nanikiru.params.spoiler.desc",
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
    league: {
      name: "commands.league.name",
      createTeam: {
        name: "commands.league.createTeam.name",
        desc: "commands.league.createTeam.desc",
      },
      createLeague: {
        name: "commands.league.createLeague.name",
        desc: "commands.league.createLeague.desc",
        params: {
          leagueName: {
            name: "commands.league.createLeague.params.leagueName.name",
            desc: "commands.league.createLeague.params.leagueName.desc",
          },
          startTime: {
            name: "commands.league.createLeague.params.startTime.name",
            desc: "commands.league.createLeague.params.startTime.desc",
          },
          endTime: {
            name: "commands.league.createLeague.params.endTime.name",
            desc: "commands.league.createLeague.params.endTime.desc",
          },
          cutoffTime: {
            name: "commands.league.createLeague.params.cutoffTime.name",
            desc: "commands.league.createLeague.params.cutoffTime.desc",
          },
          ruleset: {
            name: "commands.league.createLeague.params.ruleset.name",
            desc: "commands.league.createLeague.params.ruleset.desc",
            options: {
              ema: "commands.league.createLeague.params.ruleset.options.ema",
              wrc: "commands.league.createLeague.params.ruleset.options.wrc",
              online:
                "commands.league.createLeague.params.ruleset.options.online",
              mleague:
                "commands.league.createLeague.params.ruleset.options.mleague",
            },
          },
          platform: {
            name: "commands.league.createLeague.params.platform.name",
            desc: "commands.league.createLeague.params.platform.desc",
            options: {
              majsoul:
                "commands.league.createLeague.params.platform.options.majsoul",
              tenhou:
                "commands.league.createLeague.params.platform.options.tenhou",
              riichiCity:
                "commands.league.createLeague.params.platform.options.riichiCity",
              irl: "commands.league.createLeague.params.platform.options.irl",
            },
          },
          adminChannel: {
            name: "commands.league.createLeague.params.adminChannel.name",
            desc: "commands.league.createLeague.params.adminChannel.desc",
          },
          gameChannel: {
            name: "commands.league.createLeague.params.gameChannel.name",
            desc: "commands.league.createLeague.params.gameChannel.desc",
          },
          rankingChannel: {
            name: "commands.league.createLeague.params.rankingChannel.name",
            desc: "commands.league.createLeague.params.rankingChannel.desc",
          },
          tournamentId: {
            name: "commands.league.createLeague.params.tournamentId.name",
            desc: "commands.league.createLeague.params.tournamentId.desc",
          },
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
