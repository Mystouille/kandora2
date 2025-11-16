import { StringResources } from "./strings";

export const stringsFr: StringResources = {
  commands: {
    common: {
      shantenGoodWaitInfo: "\\*:donne un tenpai de 5+ tuiles",
    },
    ping: {
      name: "ping",
      desc: "répond pong",
    },
    createuser: {
      name: "creeutilisateur",
      desc: "cree un utilisateur",
    },
    quizz: {
      name: "quizz",
      common: {
        reply: {
          timerDisclaimerFormat: "{0} secondes par question.",
          openingMessageExploreFormat:
            "Question **[{0} / {1}]**. {2}\nRéagissez avec :eyes: pour afficher la réponse.",
          openingMessageFirstFormat:
            "Question **[{0} / {1}]**. {2}\nSeul le premier à trouver la réponse remporte un point!",
          openingMessageRaceFormat:
            "Question **[{0} / {1}]**. {2}\nVous avez {3} secondes.",
          problemIsLoading: "Affichage dans 3... 2... 1...",
          timeoutNoWinnerReply:
            "Personne n'a trouvé à temps. Ne vous découragez pas!",
          firstWinnerMessageFormat: "{0} a trouvé en premier!",
          roundOver: "(Manche terminée)",
          winnerFormat: "✅: {0}",
          loserFormat: "❌: {0}",
          continueQuizzPrompt:
            "Réagissez avec :eyes: pour commencer la question suivante",
        },
      },
      nanikiru: {
        name: "nanikiru",
        desc: "commence un quizz de wwyd",
        params: {
          nbrounds: {
            name: "nbrounds",
            desc: "Nombre de rounds du quizz",
          },
          mode: {
            name: "mode",
            desc: "Mode de fonctionnement du quizz",
            options: {
              first: "Preums",
              race: "Course",
              explore: "Explore",
            },
          },
          timeout: {
            name: "timeout",
            desc: "Nombre de secondes par question",
          },
          series: {
            name: "serie",
            desc: "La série d'exercices dont les problèmes seront tirés",
            options: {
              uzaku301: "Uzaku301",
              uzakuKin: "UzakuGold",
            },
          },
        },
        reply: {
          theadNameFormat: "Nanikiru du {0} ({1} problèmes)",
          threadFirstMessageFormat: "Une série de {0} nanikiru commence!",
          openingMessage: "Trouvez la meilleure défause.",
          answerLabel: "Réponse: ",
        },
      },
    },
    mjg: {
      name: "mjg",
      nanikiru: {
        desc: "commence un wwyd",
        name: "nanikiru",
        params: {
          hand: {
            name: "main",
            desc: "Exemple: 12333s456p555m11z. Optional: dragons= [RWG]d, winds= [ESWN]w",
          },
          discards: {
            name: "discards",
            desc: "[Optional] Allowed discards of the hand",
          },
          doras: {
            name: "doras",
            desc: "[Optionel] Exemple: 1p4s",
          },
          seat: {
            name: "joueur",
            desc: "[Optionel] Vent du joueur",
            options: {
              east: "Est",
              south: "Sud",
              west: "Ouest",
              north: "Nord",
            },
          },
          round: {
            name: "manche",
            desc: "[Optionel] Manche actuelle. Exemple: S3",
          },
          turn: {
            name: "tour",
            desc: "[Optionel] Tour dans la manche",
          },
          thread: {
            name: "fil",
            desc: "[Optionel] Crée un fil de discussion dédié",
          },
          ukeire: {
            name: "attentes",
            desc: "Affiche le nombre d'attentes de chaque défausse (Complet affiche aussi les tuiles attendues)",
            options: {
              no: "Non",
              yes: "Oui",
              full: "Complet",
            },
          },
        },
        reply: {
          seat: "Player `{0}`",
          round: "During `{0}`",
          turn: "Turn `{0}`",
          doras: "Dora {0}",
          wwyd: "Que feriez vous?",
          threadTitle: "{0} réfléchi à {1}",
        },
      },
    },
  },
};
