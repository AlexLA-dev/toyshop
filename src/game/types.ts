/** Candy category (matches a color) */
export const ToyCategory = {
  Plush: 'plush',
  Dolls: 'dolls',
  Vehicles: 'vehicles',
  Sports: 'sports',
} as const;
export type ToyCategory = (typeof ToyCategory)[keyof typeof ToyCategory];

/** Items per category */
export const TOYS: Record<ToyCategory, string[]> = {
  [ToyCategory.Plush]: ['lollipop', 'cotton_candy', 'gummy_bear', 'candy_cane', 'marshmallow'],
  [ToyCategory.Dolls]: ['cupcake', 'donut', 'macaron', 'eclair', 'cookie'],
  [ToyCategory.Vehicles]: ['chocolate', 'truffle', 'fudge', 'brownie', 'praline'],
  [ToyCategory.Sports]: ['ice_cream', 'popsicle', 'sundae', 'gelato', 'sorbet'],
};

/** Emoji for each item */
export const TOY_EMOJI: Record<string, string> = {
  lollipop: '🍭', cotton_candy: '🍬', gummy_bear: '🐻', candy_cane: '🪄', marshmallow: '☁️',
  cupcake: '🧁', donut: '🍩', macaron: '🪹', eclair: '🥐', cookie: '🍪',
  chocolate: '🍫', truffle: '🌰', fudge: '🎂', brownie: '🪵', praline: '💎',
  ice_cream: '🍦', popsicle: '🍧', sundae: '🍨', gelato: '🧊', sorbet: '🍓',
  register: '🏪',
};

/** Display names = emoji */
export const TOY_NAMES_RU: Record<string, string> = { ...TOY_EMOJI };

/** Color for each category — original palette */
export const CATEGORY_COLORS: Record<ToyCategory | 'register', string> = {
  [ToyCategory.Plush]: '#5BC0EB',     // blue
  [ToyCategory.Dolls]: '#C882D6',     // purple
  [ToyCategory.Vehicles]: '#E85D5D',  // red
  [ToyCategory.Sports]: '#7BC67E',    // green
  register: '#F5A623',                // orange
};

/** All category colors as an ordered array */
export const ALL_CATEGORY_COLORS = [
  CATEGORY_COLORS[ToyCategory.Plush],
  CATEGORY_COLORS[ToyCategory.Dolls],
  CATEGORY_COLORS[ToyCategory.Vehicles],
  CATEGORY_COLORS[ToyCategory.Sports],
];

/** Category names */
export const CATEGORY_NAMES_RU: Record<ToyCategory, string> = {
  [ToyCategory.Plush]: '🍭 Карамель',
  [ToyCategory.Dolls]: '🧁 Выпечка',
  [ToyCategory.Vehicles]: '🍫 Шоколад',
  [ToyCategory.Sports]: '🍦 Мороженое',
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
