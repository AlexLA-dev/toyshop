/** Candy category (matches a color) */
export const ToyCategory = {
  Bakery: 'bakery',
  IceCream: 'ice_cream',
  Pies: 'pies',
  Candy: 'candy',
} as const;
export type ToyCategory = (typeof ToyCategory)[keyof typeof ToyCategory];

/** Items per category (4 each) */
export const TOYS: Record<ToyCategory, string[]> = {
  [ToyCategory.Bakery]: ['waffle', 'croissant', 'donut', 'pancake'],
  [ToyCategory.IceCream]: ['shaved_ice', 'ice_cream', 'soft_serve', 'dango'],
  [ToyCategory.Pies]: ['cupcake', 'pie', 'cake', 'birthday_cake'],
  [ToyCategory.Candy]: ['lollipop', 'candy', 'chocolate', 'popcorn'],
};

/** Emoji for each item */
export const TOY_EMOJI: Record<string, string> = {
  waffle: '🧇', croissant: '🥐', donut: '🍩', pancake: '🥞',
  shaved_ice: '🍧', ice_cream: '🍨', soft_serve: '🍦', dango: '🍡',
  cupcake: '🧁', pie: '🥧', cake: '🍰', birthday_cake: '🎂',
  lollipop: '🍭', candy: '🍬', chocolate: '🍫', popcorn: '🍿',
  register: '🏪',
};

/** Display names = emoji */
export const TOY_NAMES_RU: Record<string, string> = { ...TOY_EMOJI };

/** Color for each category */
export const CATEGORY_COLORS: Record<ToyCategory | 'register', string> = {
  [ToyCategory.Bakery]: '#E85D5D',      // red
  [ToyCategory.IceCream]: '#5BC0EB',    // blue
  [ToyCategory.Pies]: '#C882D6',        // purple
  [ToyCategory.Candy]: '#7BC67E',       // green
  register: '#F5A623',                  // orange
};

/** All category colors as ordered array (for register tile quadrants) */
export const ALL_CATEGORY_COLORS = [
  CATEGORY_COLORS[ToyCategory.Bakery],
  CATEGORY_COLORS[ToyCategory.IceCream],
  CATEGORY_COLORS[ToyCategory.Pies],
  CATEGORY_COLORS[ToyCategory.Candy],
];

/** Category names */
export const CATEGORY_NAMES_RU: Record<ToyCategory, string> = {
  [ToyCategory.Bakery]: '🧇 Выпечка',
  [ToyCategory.IceCream]: '🍦 Мороженое',
  [ToyCategory.Pies]: '🧁 Пироги и торты',
  [ToyCategory.Candy]: '🍭 Конфеты и шоколад',
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
