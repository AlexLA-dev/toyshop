/** Toy category (matches a color) */
export const ToyCategory = {
  Plush: 'plush',
  Dolls: 'dolls',
  Vehicles: 'vehicles',
  Sports: 'sports',
} as const;
export type ToyCategory = (typeof ToyCategory)[keyof typeof ToyCategory];

/** Individual toy names */
export const TOYS: Record<ToyCategory, string[]> = {
  [ToyCategory.Plush]: ['puppy', 'bunny', 'cat', 'unicorn', 'bear'],
  [ToyCategory.Dolls]: ['mermaid', 'robot', 'ballerina', 'doctor', 'princess'],
  [ToyCategory.Vehicles]: ['rocket', 'crane', 'car', 'fire_truck', 'train'],
  [ToyCategory.Sports]: ['bicycle', 'rackets', 'rollerblades', 'ball', 'swim_ring'],
};

/** Display names for toys (Russian) */
export const TOY_NAMES_RU: Record<string, string> = {
  puppy: 'Щенок', bunny: 'Зайчик', cat: 'Котик', unicorn: 'Единорог', bear: 'Мишка',
  mermaid: 'Русалочка', robot: 'Робот', ballerina: 'Балерина', doctor: 'Доктор', princess: 'Принцесса',
  rocket: 'Ракета', crane: 'Кран', car: 'Машинка', fire_truck: 'Пожарная', train: 'Паровоз',
  bicycle: 'Велосипед', rackets: 'Ракетки', rollerblades: 'Ролики', ball: 'Мяч', swim_ring: 'Круг',
  register: 'Касса',
};

/** Color for each category */
export const CATEGORY_COLORS: Record<ToyCategory | 'register', string> = {
  [ToyCategory.Plush]: '#5BC0EB',     // blue
  [ToyCategory.Dolls]: '#C882D6',     // purple
  [ToyCategory.Vehicles]: '#E85D5D',  // red
  [ToyCategory.Sports]: '#7BC67E',    // green
  register: '#F5A623',                // orange/gold for cash register
};

/** Category display names */
export const CATEGORY_NAMES_RU: Record<ToyCategory, string> = {
  [ToyCategory.Plush]: 'Плюшевые',
  [ToyCategory.Dolls]: 'Куклы',
  [ToyCategory.Vehicles]: 'Машинки',
  [ToyCategory.Sports]: 'Спорт',
};

/**
 * A block within a tile. Each tile is a 2×2 grid of "cells".
 * A block occupies 1, 2, or 4 cells depending on its size.
 */
export interface TileBlock {
  /** Which cells this block occupies (indices 0-3 in row-major: TL, TR, BL, BR) */
  cells: number[];
  /** Category of this block (null = cash register) */
  category: ToyCategory | null;
  /** Specific toy name */
  toy: string;
}

/**
 * Layout type determines how the tile is subdivided.
 * Each tile is conceptually a 2×2 grid of cells.
 */
export const TileLayout = {
  /** One block covers all 4 cells */
  Full: 'full',
  /** Two blocks, each covers 2 cells (horizontal or vertical split) */
  TwoHalves: 'two_halves',
  /** One half (2 cells) + two quarters (1 cell each) */
  HalfAndTwoQuarters: 'half_two_quarters',
  /** Four quarters (each 1 cell) */
  FourQuarters: 'four_quarters',
} as const;
export type TileLayout = (typeof TileLayout)[keyof typeof TileLayout];

/** A tile (card) that can be placed on the board */
export interface Tile {
  id: string;
  layout: TileLayout;
  blocks: TileBlock[];
  /** Whether this is a starter cash register tile */
  isStarter: boolean;
}

/** Position on the board grid (tile-level coordinates) */
export interface GridPos {
  row: number;
  col: number;
}

/** A cell-level position: each tile occupies 2×2 cells, so cell coords = tile coords × 2 + offset */
export interface CellPos {
  row: number;
  col: number;
}

/** Player state */
export interface Player {
  id: string;
  name: string;
  coins: number;
  moneyTokens: number; // 10-coin tokens
  awards: Award[];
  /** The player's 4×4 tile grid. null = empty slot. */
  board: (Tile | null)[][];
  /** Where the starter tile is placed (always within the 4×4 grid) */
  starterPos: GridPos;
}

/** Award types */
export const AwardType = {
  Diversity: 'diversity',
  Majority: 'majority',
} as const;
export type AwardType = (typeof AwardType)[keyof typeof AwardType];

export interface Award {
  type: AwardType;
  category: ToyCategory;
  value: number; // always 5 coins
}

/** Game phase */
export const GamePhase = {
  Setup: 'setup',
  Playing: 'playing',
  Ended: 'ended',
} as const;
export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

/** The full game state */
export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  deck: Tile[];
  market: Tile[]; // 4 open cards
  diversityAwardsTaken: Record<ToyCategory, boolean>;
  turnStep: TurnStep;
}

export const TurnStep = {
  PickTile: 'pick_tile',
  PlaceTile: 'place_tile',
  ScoreShown: 'score_shown',
} as const;
export type TurnStep = (typeof TurnStep)[keyof typeof TurnStep];
