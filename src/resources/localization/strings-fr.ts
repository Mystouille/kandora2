import { StringResources } from "./strings";

export const stringsFr: StringResources = {
  commands: {
    ping: {
      name: "ping",
      desc: "répond pong",
    },
    createuser: {
      name: "creeutilisateur",
      desc: "cree un utilisateur",
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
          threadInfo: "Disctutez-en ici!",
        },
      },
    },
  },
};
