/** Candy category (matches a color) */
export const ToyCategory = {
  Plush: 'plush',
  Dolls: 'dolls',
  Vehicles: 'vehicles',
  Sports: 'sports',
} as const;
export type ToyCategory = (typeof ToyCategory)[keyof typeof ToyCategory];

/** Items per category — candies */
export const TOYS: Record<ToyCategory, string[]> = {
  [ToyCategory.Plush]: ['lollipop', 'cotton_candy', 'gummy_bear', 'candy_cane', 'marshmallow'],
  [ToyCategory.Dolls]: ['cupcake', 'donut', 'macaron', 'eclair', 'cookie'],
  [ToyCategory.Vehicles]: ['chocolate', 'truffle', 'fudge', 'brownie', 'praline'],
  [ToyCategory.Sports]: ['ice_cream', 'popsicle', 'sundae', 'gelato', 'sorbet'],
};

/** Emoji for each item */
export const TOY_EMOJI: Record<string, string> = {
  lollipop: '\ud83c\udf6d', cotton_candy: '\ud83c\udf6c', gummy_bear: '\ud83d\udc3b', candy_cane: '\ud83e\ude84', marshmallow: '\u2601\ufe0f',
  cupcake: '\ud83e\uddc1', donut: '\ud83c\udf69', macaron: '\ud83e\ude79', eclair: '\ud83e\udd50', cookie: '\ud83c\udf6a',
  chocolate: '\ud83c\udf6b', truffle: '\ud83c\udf30', fudge: '\ud83c\udf70', brownie: '\ud83e\udeb5', praline: '\ud83d\udc8e',
  ice_cream: '\ud83c\udf66', popsicle: '\ud83c\udf67', sundae: '\ud83c\udf68', gelato: '\ud83e\uddca', sorbet: '\ud83c\udf53',
  register: '\ud83c\udfea',
};

/** Display names (kept for tooltips) */
export const TOY_NAMES_RU: Record<string, string> = {
  lollipop: '\ud83c\udf6d', cotton_candy: '\ud83c\udf6c', gummy_bear: '\ud83d\udc3b', candy_cane: '\ud83e\ude84', marshmallow: '\u2601\ufe0f',
  cupcake: '\ud83e\uddc1', donut: '\ud83c\udf69', macaron: '\ud83e\ude79', eclair: '\ud83e\udd50', cookie: '\ud83c\udf6a',
  chocolate: '\ud83c\udf6b', truffle: '\ud83c\udf30', fudge: '\ud83c\udf70', brownie: '\ud83e\udeb5', praline: '\ud83d\udc8e',
  ice_cream: '\ud83c\udf66', popsicle: '\ud83c\udf67', sundae: '\ud83c\udf68', gelato: '\ud83e\uddca', sorbet: '\ud83c\udf53',
  register: '\ud83c\udfea',
};

/** Color for each category */
export const CATEGORY_COLORS: Record<ToyCategory | 'register', string> = {
  [ToyCategory.Plush]: '#F06292',     // pink (candy)
  [ToyCategory.Dolls]: '#CE93D8',     // lavender (baked)
  [ToyCategory.Vehicles]: '#8D6E63',  // brown (chocolate)
  [ToyCategory.Sports]: '#4FC3F7',    // sky-blue (frozen)
  register: '#FFB74D',                // orange (register)
};

/** Category names */
export const CATEGORY_NAMES_RU: Record<ToyCategory, string> = {
  [ToyCategory.Plush]: '\ud83c\udf6d \u041a\u0430\u0440\u0430\u043c\u0435\u043b\u044c',
  [ToyCategory.Dolls]: '\ud83e\uddc1 \u0412\u044b\u043f\u0435\u0447\u043a\u0430',
  [ToyCategory.Vehicles]: '\ud83c\udf6b \u0428\u043e\u043a\u043e\u043b\u0430\u0434',
  [ToyCategory.Sports]: '\ud83c\udf66 \u041c\u043e\u0440\u043e\u0436\u0435\u043d\u043e\u0435',
};

export interface TileBlock {
  cells: number[];
  category: ToyCategory | null;
  toy: string;
}

export const TileLayout = {
  Full: 'full',
  TwoHalves: 'two_halves',
  HalfAndTwoQuarters: 'half_two_quarters',
  FourQuarters: 'four_quarters',
} as const;
export type TileLayout = (typeof TileLayout)[keyof typeof TileLayout];

export interface Tile {
  id: string;
  layout: TileLayout;
  blocks: TileBlock[];
  isStarter: boolean;
}

export interface GridPos { row: number; col: number; }
export interface CellPos { row: number; col: number; }

export interface Player {
  id: string;
  name: string;
  coins: number;
  moneyTokens: number;
  awards: Award[];
  board: (Tile | null)[][];
  starterPos: GridPos;
}

export const AwardType = {
  Diversity: 'diversity',
  Majority: 'majority',
} as const;
export type AwardType = (typeof AwardType)[keyof typeof AwardType];

export interface Award {
  type: AwardType;
  category: ToyCategory;
  value: number;
}

export const GamePhase = {
  Setup: 'setup',
  Playing: 'playing',
  Ended: 'ended',
} as const;
export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  deck: Tile[];
  market: Tile[];
  diversityAwardsTaken: Record<ToyCategory, boolean>;
  turnStep: TurnStep;
}

export const TurnStep = {
  PickTile: 'pick_tile',
  PlaceTile: 'place_tile',
  ScoreShown: 'score_shown',
} as const;
export type TurnStep = (typeof TurnStep)[keyof typeof TurnStep];
