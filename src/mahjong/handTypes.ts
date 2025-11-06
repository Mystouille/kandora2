export enum MeldType {
  Chii = "c",
  Pon = "p",
  Shouminkan = "s",
  Daiminkan = "d",
  Ankan = "a",
}

export enum MeldSource {
  Self = 0,
  Shimocha = 1,
  Toimen = 2,
  Kamicha = 3,
}

export type MeldToDisplay = {
  // order matters!
  tiles: string;
  type: MeldType;
  source: MeldSource;
};

export type HandToDisplay = {
  closedTiles: string;
  melds: MeldToDisplay[];
  lastTileSeparated: boolean;
};
