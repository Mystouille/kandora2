import { StringResources } from "./strings";

export const stringsEn: StringResources = {
  commands: {
    ping: {
      name: "ping",
      desc: "replies pong",
    },
    createuser: {
      name: "createuser",
      desc: "create a user",
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
          doras: "Dora `{0}`",
          wwyd: "What would you do?",
          threadInfo: "Discuss it here!",
        },
      },
    },
  },
};
