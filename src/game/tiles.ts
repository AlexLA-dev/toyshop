import type { Tile, TileBlock } from './types';
import { TileLayout, ToyCategory, TOYS } from './types';

let tileIdCounter = 0;

function nextTileId(): string {
  return `tile_${++tileIdCounter}`;
}

/** Reset counter (for tests) */
export function resetTileIdCounter(): void {
  tileIdCounter = 0;
}

/**
 * Possible half splits (each half = 2 cells):
 * - Top row [0,1] + Bottom row [2,3]
 * - Left col [0,2] + Right col [1,3]
 */
const HALF_SPLITS: [number[], number[]][] = [
  [[0, 1], [2, 3]], // horizontal
  [[0, 2], [1, 3]], // vertical
];

/**
 * Half + two quarters layouts:
 * For each half (2 cells), the remaining 2 cells are individual quarters.
 */
const HALF_QUARTER_SPLITS: { half: number[]; quarters: [number[], number[]] }[] = [
  { half: [0, 1], quarters: [[2], [3]] }, // top half, bottom-left + bottom-right
  { half: [2, 3], quarters: [[0], [1]] }, // bottom half, top-left + top-right
  { half: [0, 2], quarters: [[1], [3]] }, // left half, top-right + bottom-right
  { half: [1, 3], quarters: [[0], [2]] }, // right half, top-left + bottom-left
];

/** Pick a random element from an array */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick a random toy from a category */
function randomToy(category: ToyCategory): { category: ToyCategory; toy: string } {
  return { category, toy: pickRandom(TOYS[category]) };
}

/** Pick a random category */
function randomCategory(): ToyCategory {
  const cats = Object.values(ToyCategory);
  return pickRandom(cats);
}

/** Pick N distinct random categories */
function distinctCategories(n: number): ToyCategory[] {
  const all = shuffle(Object.values(ToyCategory) as ToyCategory[]);
  return all.slice(0, n);
}

/** Generate a tile with the Full layout (all one color) */
function generateFullTile(): Tile {
  const cat = randomCategory();
  const { toy } = randomToy(cat);
  const blocks: TileBlock[] = [{ cells: [0, 1, 2, 3], category: cat, toy }];
  return { id: nextTileId(), layout: TileLayout.Full, blocks, isStarter: false };
}

/** Generate a tile with two halves (always different colors) */
function generateTwoHalvesTile(): Tile {
  const split = pickRandom(HALF_SPLITS);
  const [cat1, cat2] = distinctCategories(2);
  const { toy: toy1 } = randomToy(cat1);
  const { toy: toy2 } = randomToy(cat2);
  const blocks: TileBlock[] = [
    { cells: split[0], category: cat1, toy: toy1 },
    { cells: split[1], category: cat2, toy: toy2 },
  ];
  return { id: nextTileId(), layout: TileLayout.TwoHalves, blocks, isStarter: false };
}

/** Generate a tile with half + two quarters (all 3 blocks different colors) */
function generateHalfTwoQuartersTile(): Tile {
  const split = pickRandom(HALF_QUARTER_SPLITS);
  const [catHalf, catQ1, catQ2] = distinctCategories(3);
  const { toy: toyHalf } = randomToy(catHalf);
  const { toy: toyQ1 } = randomToy(catQ1);
  const { toy: toyQ2 } = randomToy(catQ2);
  const blocks: TileBlock[] = [
    { cells: split.half, category: catHalf, toy: toyHalf },
    { cells: split.quarters[0], category: catQ1, toy: toyQ1 },
    { cells: split.quarters[1], category: catQ2, toy: toyQ2 },
  ];
  return { id: nextTileId(), layout: TileLayout.HalfAndTwoQuarters, blocks, isStarter: false };
}

/** Generate a tile with four quarters (all 4 blocks different colors) */
function generateFourQuartersTile(): Tile {
  const cats = shuffle(Object.values(ToyCategory) as ToyCategory[]);
  const blocks: TileBlock[] = [0, 1, 2, 3].map((cellIdx, i) => {
    const { toy } = randomToy(cats[i]);
    return { cells: [cellIdx], category: cats[i], toy };
  });
  return { id: nextTileId(), layout: TileLayout.FourQuarters, blocks, isStarter: false };
}

/** Generate a starter cash register tile */
function generateStarterTile(): Tile {
  const blocks: TileBlock[] = [
    { cells: [0, 1, 2, 3], category: null, toy: 'register' },
  ];
  return { id: nextTileId(), layout: TileLayout.Full, blocks, isStarter: true };
}

/** Distribution weights for tile layouts */
const LAYOUT_WEIGHTS: { generator: () => Tile; weight: number }[] = [
  { generator: generateFullTile, weight: 8 },
  { generator: generateTwoHalvesTile, weight: 20 },
  { generator: generateHalfTwoQuartersTile, weight: 20 },
  { generator: generateFourQuartersTile, weight: 16 },
];

function pickWeightedGenerator(): () => Tile {
  const totalWeight = LAYOUT_WEIGHTS.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * totalWeight;
  for (const entry of LAYOUT_WEIGHTS) {
    r -= entry.weight;
    if (r <= 0) return entry.generator;
  }
  return LAYOUT_WEIGHTS[LAYOUT_WEIGHTS.length - 1].generator;
}

/** Generate the full deck of 64 toy cards */
export function generateDeck(): Tile[] {
  const deck: Tile[] = [];
  for (let i = 0; i < 64; i++) {
    deck.push(pickWeightedGenerator()());
  }
  return shuffle(deck);
}

/** Generate 4 starter tiles */
export function generateStarterTiles(): Tile[] {
  return [generateStarterTile(), generateStarterTile(), generateStarterTile(), generateStarterTile()];
}

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Create a specific tile (for tutorial / scripted games) */
export function makeTile(
  layout: TileLayout,
  blocks: { cells: number[]; category: ToyCategory | null; toy: string }[],
  isStarter = false,
): Tile {
  return { id: nextTileId(), layout, blocks, isStarter };
}

/**
 * Generate scripted first-market tiles for the tutorial.
 * Tile 0 (full bakery/red) → place at (1,2) → score 0 (single tile).
 * After removal, tile 2 (bakery/pies) becomes index 1 → place at (0,2) → score 2000 (2 bakery tiles).
 */
export function generateTutorialMarket(): Tile[] {
  return [
    // 0: Full bakery (red) — the recommended first pick
    makeTile(TileLayout.Full, [
      { cells: [0, 1, 2, 3], category: ToyCategory.Bakery, toy: 'donut' },
    ]),
    // 1: Two halves — ice cream top / candy bottom
    makeTile(TileLayout.TwoHalves, [
      { cells: [0, 1], category: ToyCategory.IceCream, toy: 'soft_serve' },
      { cells: [2, 3], category: ToyCategory.Candy, toy: 'lollipop' },
    ]),
    // 2: Two halves — bakery left / pies right (bakery continues the red chain)
    makeTile(TileLayout.TwoHalves, [
      { cells: [0, 2], category: ToyCategory.Bakery, toy: 'croissant' },
      { cells: [1, 3], category: ToyCategory.Pies, toy: 'cupcake' },
    ]),
    // 3: Four quarters — one of each
    makeTile(TileLayout.FourQuarters, [
      { cells: [0], category: ToyCategory.Bakery, toy: 'waffle' },
      { cells: [1], category: ToyCategory.IceCream, toy: 'ice_cream' },
      { cells: [2], category: ToyCategory.Pies, toy: 'cake' },
      { cells: [3], category: ToyCategory.Candy, toy: 'chocolate' },
    ]),
  ];
}

/**
 * Generate a tutorial deck — first few cards are good for learning combos.
 */
export function generateTutorialDeck(): Tile[] {
  const scripted: Tile[] = [
    makeTile(TileLayout.TwoHalves, [
      { cells: [0, 1], category: ToyCategory.Bakery, toy: 'pancake' },
      { cells: [2, 3], category: ToyCategory.IceCream, toy: 'dango' },
    ]),
    makeTile(TileLayout.HalfAndTwoQuarters, [
      { cells: [0, 1], category: ToyCategory.Candy, toy: 'candy' },
      { cells: [2], category: ToyCategory.Bakery, toy: 'waffle' },
      { cells: [3], category: ToyCategory.Pies, toy: 'pie' },
    ]),
    makeTile(TileLayout.Full, [
      { cells: [0, 1, 2, 3], category: ToyCategory.IceCream, toy: 'shaved_ice' },
    ]),
  ];
  const random: Tile[] = [];
  for (let i = 0; i < 61; i++) {
    random.push(pickWeightedGenerator()());
  }
  return [...scripted, ...shuffle(random)];
}
