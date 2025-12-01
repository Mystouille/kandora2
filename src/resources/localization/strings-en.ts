import { StringResources } from "./strings";

export const stringsEn: StringResources = {
  commands: {
    common: {
      shantenGoodWaitInfo: "\\*:yields a 5+ tile tenpai",
    },
    ping: {
      name: "ping",
      desc: "replies pong",
    },
    admin: {
      name: "admin",
      desc: "admin commands",
      checkNanikiru: {
        name: "checknanikiru",
        desc: " display a nanikiru problem by its ID to check its content",
        params: {
          id: {
            name: "id",
            desc: "The google sheets row ID of the problem to check",
          },
        },
      },
    },
    createuser: {
      name: "createuser",
      desc: "create a user",
    },
    quiz: {
      name: "quiz",
      common: {
        params: {
          nbrounds: {
            name: "nbrounds",
            desc: "Number of rounds in the game",
          },
          mode: {
            name: "mode",
            desc: "First: Only the first wins. Race: Be fast. Explore: Take your time!",
            options: {
              first: "First",
              race: "Race",
              explore: "Explore",
            },
          },
          timeout: {
            name: "timeout",
            desc: "Number of seconds per question",
          },
        },
        reply: {
          timerDisclaimerFormat: "{0} seconds per question.",
          openingMessageExploreFormat:
            "Question **[{0} / {1}]**. {2}\nReact with :eyes: to display the answer.",
          openingMessageFirstFormat:
            "Question **[{0} / {1}]**. {2}\nOnly the first to answer correctly gets a point!",
          openingMessageRaceFormat:
            "Question **[{0} / {1}]**. {2}\nYou have {2} seconds.",
          problemIsLoading: "Displaying in 3... 2... 1...",
          timeoutNoWinnerReply:
            "No one answered correctly. Don't get discouraged!",
          firstWinnerMessageFormat: "{0} got this one first!",
          roundOver: "(Round over)",
          winnerFormat: "✅: {0}",
          loserFormat: "❌: {0}",
          continueQuizPrompt: "React with :eyes: to start the next question",
          quizIsOver: "The quiz is over",
        },
      },
      nanikiru: {
        name: "nanikiru",
        desc: "Starts a wwyd quiz game",
        params: {
          series: {
            name: "series",
            desc: "The series from where the problems will be selected",
            options: {
              uzaku301: "Uzaku301",
              uzakuKin: "UzakuGold",
            },
          },
        },
        reply: {
          theadNameFormat: "Nanikiru of {0} ({1} problems)",
          threadFirstMessageFormat: "A series of {0} nanikiru is starting!",
          openingMessage: "Find the best discard.",
          answerLabel: "Answer: ",
        },
      },
      chinitsu: {
        name: "chinitsu",
        desc: "Starts a chinitsu quiz game",
        params: {
          suit: {
            name: "suit",
            desc: "Select the suit used (random by default)",
            options: {
              pinzu: "Pinzu",
              manzu: "Manzu",
              souzu: "Souzu",
            },
          },
          difficulty: {
            name: "level",
            desc: "Easy: with single waits. Difficult: 3 or more waits. (Default: Normal)",
            options: {
              easy: "Easy",
              normal: "Normal",
              hard: "Difficult",
            },
          },
        },
        reply: {
          theadNameFormat: "Chinitsu of {0} ({1} problems)",
          threadFirstMessageFormat: "A series of {0} chinitsu is starting!",
          openingMessage: "Find the waits of this hand:",
          answerLabel: "Answer: ",
        },
      },
    },
    mjg: {
      name: "mjg",
      nanikiru: {
        name: "nanikiru",
        desc: "display a hand to think about",
        params: {
          hand: {
            name: "hand",
            desc: "Example: 12333s456p555m11z. Optional: dragons= [RWG]d, winds= [ESWN]w",
          },
          discards: {
            name: "defausses",
            desc: "[Optionel] Défausses permises de la main.",
          },
          doras: {
            name: "doras",
            desc: "[Optional] Example: 1p4s",
          },
          seat: {
            name: "seat",
            desc: "[Optional] Player's wind",
            options: {
              east: "East",
              south: "South",
              west: "West",
              north: "North",
            },
          },
          round: {
            name: "round",
            desc: "[Optional] Current round. Example: S3",
          },
          turn: {
            name: "turn",
            desc: "[Optional] Current turn",
          },
          thread: {
            name: "thread",
            desc: "[Optional] Create a thread tho talk about it",
          },
          ukeire: {
            name: "waits",
            desc: 'isplays the number of waits of each discard ("Full" also displays the waits)',
            options: {
              no: "No",
              yes: "Yes",
              full: "Full",
            },
          },
        },
        reply: {
          seat: "Player `{0}`",
          round: "During `{0}`",
          turn: "Turn `{0}`",
          doras: "Dora {0}",
          wwyd: "What would you do?",
          threadTitle: "{0} wonders about {1}",
        },
      },
    },
    league: {
      name: "league",
      create: {
        name: "create",
        desc: "create a league",
        params: {
          leagueName: {
            name: "leaguename",
            desc: "Name of the league to create",
          },
          startTime: {
            name: "starttime",
            desc: "Start time of the league (format: YYYY-MM-DD HH:mm in UTC)",
          },
          endTime: {
            name: "endtime",
            desc: "End time of the league (format: YYYY-MM-DD HH:mm in UTC)",
          },
          cutoffTime: {
            name: "cutofftime",
            desc: "[Optional] Start time of the final phase (format: YYYY-MM-DD HH:mm in UTC)",
          },
          ruleset: {
            name: "ruleset",
            desc: "Ruleset used for the league",
            options: {
              ema: "EMA",
              wrc: "WRC",
              online: "Online",
              mleague: "M-League",
            },
          },
          platform: {
            name: "platform",
            desc: "Platform where the league will be played",
            options: {
              tenhou: "Tenhou",
              majsoul: "Mahjong Soul",
              riichiCity: "Riichi City",
              irl: "In real life",
            },
          },
        },
      },
    },
  },
};
