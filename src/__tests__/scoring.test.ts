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
    board[0][1] = fullTile('t1', ToyCategory.Plush, 'lollipop');
    expect(getCategoryAtCell(board, { row: 0, col: 2 })).toBe(ToyCategory.Plush);
  });

  it('handles two-halves tiles correctly', () => {
    const board = boardWithRegister();
    board[0][0] = twoHalvesTile('t2', ToyCategory.Plush, 'lollipop', ToyCategory.Vehicles, 'chocolate');
    expect(getCategoryAtCell(board, { row: 0, col: 0 })).toBe(ToyCategory.Plush);
    expect(getCategoryAtCell(board, { row: 0, col: 1 })).toBe(ToyCategory.Plush);
    expect(getCategoryAtCell(board, { row: 1, col: 0 })).toBe(ToyCategory.Vehicles);
    expect(getCategoryAtCell(board, { row: 1, col: 1 })).toBe(ToyCategory.Vehicles);
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
    board[0][1] = fullTile('t1', ToyCategory.Plush, 'lollipop');
    const placements = getValidPlacements(board);
    const posSet = new Set(placements.map(p => `${p.row},${p.col}`));
    expect(posSet.has('1,1')).toBe(false);
    expect(posSet.has('0,1')).toBe(false);
  });

  it('expands valid placements when more tiles are placed', () => {
    const board = boardWithRegister();
    board[0][1] = fullTile('t1', ToyCategory.Plush, 'lollipop');
    const placements = getValidPlacements(board);
    const posSet = new Set(placements.map(p => `${p.row},${p.col}`));
    expect(posSet.has('0,0')).toBe(true);
    expect(posSet.has('0,2')).toBe(true);
  });
});

describe('calculatePlacementScore', () => {
  it('scores 0 when tile has no matching neighbors', () => {
    const board = boardWithRegister();
    board[0][1] = fullTile('t1', ToyCategory.Plush, 'lollipop');
    const vehiclesTile = fullTile('t2', ToyCategory.Vehicles, 'chocolate');
    const result = calculatePlacementScore(board, vehiclesTile, { row: 0, col: 0 });
    expect(result.total).toBe(0);
  });

  it('scores region size when matching color connects', () => {
    const board = boardWithRegister();
    board[0][1] = fullTile('t1', ToyCategory.Plush, 'lollipop');
    const plushTile = fullTile('t2', ToyCategory.Plush, 'cotton_candy');
    const result = calculatePlacementScore(board, plushTile, { row: 0, col: 0 });
    expect(result.total).toBe(8);
  });

  it('gives minimum 1 when touching register', () => {
    const board = boardWithRegister();
    const tile = fullTile('t1', ToyCategory.Dolls, 'cupcake');
    const result = calculatePlacementScore(board, tile, { row: 1, col: 0 });
    expect(result.total).toBeGreaterThanOrEqual(1);
  });

  it('register connects separate regions of the same color', () => {
    const board = boardWithRegister();
    board[1][0] = fullTile('t1', ToyCategory.Plush, 'lollipop');
    const plushTile = fullTile('t2', ToyCategory.Plush, 'cotton_candy');
    const result = calculatePlacementScore(board, plushTile, { row: 1, col: 2 });
    expect(result.total).toBe(8);
  });
});

describe('checkDiversityAward', () => {
  it('returns false when fewer than 5 different candies', () => {
    const board = boardWithRegister();
    board[0][0] = fullTile('t1', ToyCategory.Plush, 'lollipop');
    board[0][1] = fullTile('t2', ToyCategory.Plush, 'cotton_candy');
    const player: Player = {
      id: 'p1', name: 'Test', coins: 0, moneyTokens: 0, awards: [],
      board, starterPos: { row: 1, col: 1 },
    };
    expect(checkDiversityAward(player, ToyCategory.Plush)).toBe(false);
  });

  it('returns true when 5 different candies of same category', () => {
    const board = boardWithRegister();
    const fiveInTwoTiles: Tile[] = [
      {
        id: 'multi1',
        layout: TileLayout.FourQuarters,
        blocks: [
          { cells: [0], category: ToyCategory.Plush, toy: 'lollipop' },
          { cells: [1], category: ToyCategory.Plush, toy: 'cotton_candy' },
          { cells: [2], category: ToyCategory.Plush, toy: 'gummy_bear' },
          { cells: [3], category: ToyCategory.Plush, toy: 'candy_cane' },
        ],
        isStarter: false,
      },
      {
        id: 'multi2',
        layout: TileLayout.FourQuarters,
        blocks: [
          { cells: [0], category: ToyCategory.Plush, toy: 'marshmallow' },
          { cells: [1], category: ToyCategory.Dolls, toy: 'cupcake' },
          { cells: [2], category: ToyCategory.Vehicles, toy: 'chocolate' },
          { cells: [3], category: ToyCategory.Sports, toy: 'ice_cream' },
        ],
        isStarter: false,
      },
    ];
    board[0][1] = fiveInTwoTiles[0];
    board[1][0] = fiveInTwoTiles[1];
    const player: Player = {
      id: 'p1', name: 'Test', coins: 0, moneyTokens: 0, awards: [],
      board, starterPos: { row: 1, col: 1 },
    };
    expect(checkDiversityAward(player, ToyCategory.Plush)).toBe(true);
  });
});

describe('calculateFinalScore', () => {
  it('sums coins, money tokens, and awards', () => {
    const board = boardWithRegister();
    const player: Player = {
      id: 'p1', name: 'Test',
      coins: 7,
      moneyTokens: 2,
      awards: [
        { type: AwardType.Diversity, category: ToyCategory.Plush, value: 5 },
        { type: AwardType.Majority, category: ToyCategory.Dolls, value: 5 },
      ],
      board,
      starterPos: { row: 1, col: 1 },
    };
    expect(calculateFinalScore(player)).toBe(37);
  });
});
