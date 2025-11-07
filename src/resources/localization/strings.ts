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
          threadInfo: "commands.mjg.nanikiru.reply.threadInfo",
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
