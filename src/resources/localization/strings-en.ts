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
    createuser: {
      name: "createuser",
      desc: "create a user",
    },
    quizz: {
      name: "quizz",
      common: {
        reply: {
          timerDisclaimerFormat: "{0} seconds per question.",
          openingMessageExploreFormat:
            "Question **[{0} / {1}]**. {2}\nReact with :eyes: to display the answer.",
          openingMessageFirstFormat:
            "Question **[{0} / {1}]**. {2}\nOnly the first to answer correctly with get a point!",
          openingMessageRaceFormat:
            "Question **[{0} / {1}]**. {2}\nYou have {2} seconds.",
          problemIsLoading: "Displaying in 3... 2... 1...",
          timeoutNoWinnerReply:
            "No one answered correctly. Don't get discouraged!",
          firstWinnerMessageFormat: "{0} got this one first!",
          roundOver: "(Round over)",
          winnerFormat: "✅: {0}",
          loserFormat: "❌: {0}",
        },
      },
      nanikiru: {
        name: "nanikiru",
        desc: "Starts a wwyd quizz game",
        params: {
          nbrounds: {
            name: "nbrounds",
            desc: "Number of rounds in the game",
          },
          mode: {
            name: "mode",
            desc: "The game mode",
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
          theadNameFormat: "Nanikiru du {0} ({1} problèmes)",
          threadFirstMessageFormat: "Une série de {0} nanikiru commence!",
          openingMessage: "Find the best discard.",
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
  },
};
