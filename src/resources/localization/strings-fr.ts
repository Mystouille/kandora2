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
    quiz: {
      name: "quiz",
      common: {
        params: {
          nbrounds: {
            name: "nbrounds",
            desc: "Nombre de rounds du quiz",
          },
          mode: {
            name: "mode",
            desc: "Preums: Seul le premier gagne. Course: Soyez rapide. Explore: Prenez votre temps.",
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
        },
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
          continueQuizPrompt:
            "Réagissez avec :eyes: pour commencer la question suivante",
          quizIsOver: "Le quiz est fini!",
        },
      },
      nanikiru: {
        name: "nanikiru",
        desc: "commence un quiz de wwyd",
        params: {
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
      chinitsu: {
        name: "chinitsu",
        desc: "commence un quiz de chinitsu",
        params: {
          suit: {
            name: "famille",
            desc: "Choisi la famille de tuile utilisée (aléatoire par défaut)",
            options: {
              pinzu: "Pinzu",
              manzu: "Manzu",
              souzu: "Souzu",
            },
          },
          difficulty: {
            name: "niveau",
            desc: "Facile: avec kanchan. Difficile: 3 attentes ou plus. (défaut: Normal)",
            options: {
              easy: "Facile",
              normal: "Normal",
              hard: "Difficile",
            },
          },
        },
        reply: {
          theadNameFormat: "Chinitsu du {0} ({1} problèmes)",
          threadFirstMessageFormat: "Une série de {0} chinitsu commence!",
          openingMessage: "Trouvez la/les attentes de cette main:",
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
    league: {
      name: "ligue",
      create: {
        desc: "crée une nouvelle ligue",
        name: "creer",
        params: {
          leagueName: {
            name: "nom",
            desc: "Le nom de la ligue (emojis autorisés)",
          },
          startTime: {
            name: "datedebut",
            desc: "Date de début de la ligue (format AAAA-MM-JJ HH:MM en UTC)",
          },
          endTime: {
            name: "datefin",
            desc: "Date de fin de la ligue (format AAAA-MM-JJ HH:MM en UTC)",
          },
          cutoffTime: {
            name: "datedebutfinale",
            desc: "[Optionel] Date de début de la phase finale (format AAAA-MM-JJ HH:MM en UTC)",
          },
          ruleset: {
            name: "regles",
            desc: "Le règlement utilisé pour la ligue",
            options: {
              ema: "EMA",
              wrc: "WRC",
              online: "Online",
              mleague: "M-League",
            },
          },
          platform: {
            name: "plateforme",
            desc: "La plateforme utilisée pour les matchs",
            options: {
              tenhou: "Tenhou",
              majsoul: "Mahjong Soul",
              riichiCity: "Riichi City",
              irl: "En physique",
            },
          },
        },
      },
    },
  },
};
