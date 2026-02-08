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
    admin: {
      name: "admin",
      desc: "commandes admin",
      checkNanikiru: {
        name: "checknanikiru",
        desc: " affiche un problème nanikiru par son ID pour vérifier son contenu",
        params: {
          id: {
            name: "id",
            desc: "L'ID de la ligne dans Google Sheets du problème à vérifier",
          },
        },
      },
    },
    createuser: {
      name: "createuser",
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
            "Question **[{0} / {1}]**.\nRéagissez avec :eyes: pour afficher la réponse.",
          openingMessageFirstFormat:
            "Question **[{0} / {1}]**.\nSeul le premier à trouver la réponse remporte un point!",
          openingMessageRaceFormat:
            "Question **[{0} / {1}]**.\nVous avez {3} secondes.",
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
          defaultOpeningMessage: "Trouvez la meilleure défause.",
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
    myinfo: {
      name: "myinfo",
      update: {
        name: "update",
        desc: "affiche/modifie vos informations",
      },
      delete: {
        name: "delete",
        desc: "supprime vos informations",
        reply: {
          noDataToDelete: "L'utilisateur n'a pas de données à supprimer.",
          modalTitle: "Confirmer la suppression des informations",
          confirmationMessage:
            "### ⚡💀Êtes-vous sûr de vouloir supprimer vos informations ? Cette action ne peut pas être annulée. Toutes vos données seront supprimées de la base de données de Kandora, y compris votre historique de jeux et tournois.\nLes parties enregistrées seront conservées mais contiendront \`anonyme\` au lieu de votre nom d'utilisateur.",
          usernameLabel: "Entrez votre nom d'utilisateur Discord : {0}",
          usernamePlaceholder: "Votre nom d'utilisateur Discord",
          userNotFound: "Utilisateur non trouvé.",
          successMessage:
            "Vos informations ont été supprimées. Tout ce qui était lié à votre identité a disparu, même si certaines données de jeu anonymes peuvent subsister.",
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
          spoiler: {
            name: "spoiler",
            desc: "[Optionel] Masque les ukeire",
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
          seat: "Joueur `{0}`",
          round: "Pendant `{0}`",
          turn: "Tour `{0}`",
          doras: "Dora {0}",
          wwyd: "Que feriez vous?",
          threadTitle: "{0} réfléchi à {1}",
        },
      },
    },
    league: {
      name: "league",
      createTeam: {
        name: "createteam",
        desc: "crée une nouvelle équipe dans la ligue en cours",
      },
      createLeague: {
        desc: "crée une nouvelle ligue",
        name: "createleague",
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
          adminChannel: {
            name: "canaladmin",
            desc: "Canal admin de la ligue (pause des matchs, notifs, etc)",
          },
          gameChannel: {
            name: "canalmatch",
            desc: "Canal où les statuts/résultats des matchs seront postés",
          },
          rankingChannel: {
            name: "canalclassement",
            desc: "Canal où les classements de la ligue seront postés",
          },
          tournamentId: {
            name: "idtournoi",
            desc: "ID de tournoi optionnel pour l'intégration de plateforme en ligne",
          },
        },
      },
    },
  },
  system: {
    league: {
      unknownTeam: "Équipe inconnue",
      unknownUser: "Utilisateur inconnu",
      rankingTitleFormat: "**🏆 Classement des équipes - {0}**",
      rankingLineFormat: "**{0}.** {1} : {2} ({3} parties)",
      noGamesRecorded: "Aucune partie enregistrée.",
      pendingScoresHeader:
        "**⏳ Scores en attente (non comptabilisés à cause du quota de 35%)**",
      pendingScoreLineFormat: "- {0} ({1}): {2}",
      lastUpdatedFormat: "_Dernière mise à jour: {0}_",
      newGameRecordedFormat:
        "**Nouvelle partie enregistrée pour la ligue {0}**",
      invalidGameDetectedFormat:
        "**Partie invalide détectée pour la ligue {0}**",
      playersNotInTeam:
        "Tous les joueurs ne sont pas inscrits dans une équipe pour cette ligue:",
      scoresNotAvailable: "Scores non disponibles",
      startTimeLabel: "**Début:**",
      endTimeLabel: "**Fin:**",
      gameLinkLabel: "**Lien de la partie:**",
      unknownTime: "Inconnu",
    },
  },
};
