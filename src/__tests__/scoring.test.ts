import { describe, it, expect } from 'vitest';
import type { Tile, Player } from '../game/types';
import { TileLayout, ToyCategory, AwardType } from '../game/types';
import {
  getCategoryAtCell,
  calculatePlacementScore,
  getValidPlacements,
  checkDiversityAward,
  calculateFinalScore,
} from '../game/scoring';

/** Helper: create a full tile of one category */
function fullTile(id: string, category: ToyCategory | null, toy: string): Tile {
  return {
    id,
    layout: TileLayout.Full,
    blocks: [{ cells: [0, 1, 2, 3], category, toy }],
    isStarter: category === null,
  };
}

/** Helper: create a two-halves tile (horizontal split: top/bottom) */
function twoHalvesTile(
  id: string,
  topCat: ToyCategory, topToy: string,
  bottomCat: ToyCategory, bottomToy: string,
): Tile {
  return {
    id,
    layout: TileLayout.TwoHalves,
    blocks: [
      { cells: [0, 1], category: topCat, toy: topToy },
      { cells: [2, 3], category: bottomCat, toy: bottomToy },
    ],
    isStarter: false,
  };
}

/** Helper: create an empty 4x4 board with a register at (1,1) */
function boardWithRegister(): (Tile | null)[][] {
  const board: (Tile | null)[][] = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => null)
  );
  board[1][1] = fullTile('register', null, 'register');
  return board;
}

describe('getCategoryAtCell', () => {
  it('returns undefined for empty cells', () => {
    const board = boardWithRegister();
    expect(getCategoryAtCell(board, { row: 0, col: 0 })).toBeUndefined();
  });

  it('returns null for register cells', () => {
    const board = boardWithRegister();
    expect(getCategoryAtCell(board, { row: 2, col: 2 })).toBeNull();
    expect(getCategoryAtCell(board, { row: 3, col: 3 })).toBeNull();
  });

  it('returns category for candy cells', () => {
    const board = boardWithRegister();
    board[0][1] = fullTile('t1', ToyCategory.Bakery, 'donut');
    expect(getCategoryAtCell(board, { row: 0, col: 2 })).toBe(ToyCategory.Bakery);
  });

  it('handles two-halves tiles correctly', () => {
    const board = boardWithRegister();
    board[0][0] = twoHalvesTile('t2', ToyCategory.Bakery, 'donut', ToyCategory.Candy, 'chocolate');
    expect(getCategoryAtCell(board, { row: 0, col: 0 })).toBe(ToyCategory.Bakery);
    expect(getCategoryAtCell(board, { row: 0, col: 1 })).toBe(ToyCategory.Bakery);
    expect(getCategoryAtCell(board, { row: 1, col: 0 })).toBe(ToyCategory.Candy);
    expect(getCategoryAtCell(board, { row: 1, col: 1 })).toBe(ToyCategory.Candy);
  });
});

describe('getValidPlacements', () => {
  it('returns positions adjacent to the starter tile', () => {
    const board = boardWithRegister();
    const placements = getValidPlacements(board);
    expect(placements).toHaveLength(4);
    const posSet = new Set(placements.map(p => `${p.row},${p.col}`));
    expect(posSet.has('0,1')).toBe(true);
    expect(posSet.has('2,1')).toBe(true);
    expect(posSet.has('1,0')).toBe(true);
    expect(posSet.has('1,2')).toBe(true);
  });

  it('does not include occupied positions', () => {
    const board = boardWithRegister();
    board[0][1] = fullTile('t1', ToyCategory.Bakery, 'donut');
    const placements = getValidPlacements(board);
    const posSet = new Set(placements.map(p => `${p.row},${p.col}`));
    expect(posSet.has('1,1')).toBe(false);
    expect(posSet.has('0,1')).toBe(false);
  });

  it('expands valid placements when more tiles are placed', () => {
    const board = boardWithRegister();
    board[0][1] = fullTile('t1', ToyCategory.Bakery, 'donut');
    const placements = getValidPlacements(board);
    const posSet = new Set(placements.map(p => `${p.row},${p.col}`));
    expect(posSet.has('0,0')).toBe(true);
    expect(posSet.has('0,2')).toBe(true);
  });
});

describe('calculatePlacementScore', () => {
  it('scores 0 when tile has no matching neighbors', () => {
    const board = boardWithRegister();
    board[0][1] = fullTile('t1', ToyCategory.Bakery, 'donut');
    const candyTile = fullTile('t2', ToyCategory.Candy, 'chocolate');
    const result = calculatePlacementScore(board, candyTile, { row: 0, col: 0 });
    expect(result.total).toBe(0);
  });

  it('scores 2000 when two tiles of matching color connect', () => {
    const board = boardWithRegister();
    board[0][1] = fullTile('t1', ToyCategory.Bakery, 'donut');
    const bakeryTile = fullTile('t2', ToyCategory.Bakery, 'croissant');
    // Two tiles with bakery = score 2 × 1000
    const result = calculatePlacementScore(board, bakeryTile, { row: 0, col: 0 });
    expect(result.total).toBe(2000);
  });

  it('scores 0 when placing next to register (single tile in region)', () => {
    const board = boardWithRegister();
    const tile = fullTile('t1', ToyCategory.IceCream, 'soft_serve');
    // Single tile touching register: region has only 1 tile, needs 2+ to score
    const result = calculatePlacementScore(board, tile, { row: 1, col: 0 });
    expect(result.total).toBe(0);
  });

  it('register connects separate regions of the same color', () => {
    const board = boardWithRegister();
    board[1][0] = fullTile('t1', ToyCategory.Bakery, 'donut');
    const bakeryTile = fullTile('t2', ToyCategory.Bakery, 'croissant');
    // Two bakery tiles connected through register = 2 × 1000
    const result = calculatePlacementScore(board, bakeryTile, { row: 1, col: 2 });
    expect(result.total).toBe(2000);
  });

  it('scores 3000 when connecting to two existing tiles', () => {
    const board = boardWithRegister();
    board[0][1] = fullTile('t1', ToyCategory.Bakery, 'donut');
    board[1][0] = fullTile('t2', ToyCategory.Bakery, 'croissant');
    // Place at (0,0): connects to t1 directly, and to t2 directly = 3 × 1000
    const bakeryTile = fullTile('t3', ToyCategory.Bakery, 'waffle');
    const result = calculatePlacementScore(board, bakeryTile, { row: 0, col: 0 });
    expect(result.total).toBe(3000);
  });
});

describe('checkDiversityAward', () => {
  it('returns false when fewer than 4 different items', () => {
    const board = boardWithRegister();
    board[0][0] = fullTile('t1', ToyCategory.Bakery, 'donut');
    board[0][1] = fullTile('t2', ToyCategory.Bakery, 'croissant');
    const player: Player = {
      id: 'p1', name: 'Test', coins: 0, moneyTokens: 0, awards: [],
      board, starterPos: { row: 1, col: 1 },
    };
    expect(checkDiversityAward(player, ToyCategory.Bakery)).toBe(false);
  });

  it('returns true when all 4 different items of same category', () => {
    const board = boardWithRegister();
    board[0][1] = {
      id: 'multi1',
      layout: TileLayout.FourQuarters,
      blocks: [
        { cells: [0], category: ToyCategory.Bakery, toy: 'waffle' },
        { cells: [1], category: ToyCategory.Bakery, toy: 'croissant' },
        { cells: [2], category: ToyCategory.Bakery, toy: 'donut' },
        { cells: [3], category: ToyCategory.Bakery, toy: 'pancake' },
      ],
      isStarter: false,
    };
    const player: Player = {
      id: 'p1', name: 'Test', coins: 0, moneyTokens: 0, awards: [],
      board, starterPos: { row: 1, col: 1 },
    };
    expect(checkDiversityAward(player, ToyCategory.Bakery)).toBe(true);
  });
});

describe('calculateFinalScore', () => {
  it('sums coins and awards', () => {
    const board = boardWithRegister();
    const player: Player = {
      id: 'p1', name: 'Test',
      coins: 7000,
      moneyTokens: 0,
      awards: [
        { type: AwardType.Diversity, category: ToyCategory.Bakery, value: 5000 },
        { type: AwardType.Majority, category: ToyCategory.IceCream, value: 5000 },
      ],
      board,
      starterPos: { row: 1, col: 1 },
    };
    expect(calculateFinalScore(player)).toBe(17000);
  });
});
