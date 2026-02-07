import { describe, it, expect } from 'vitest';
import type { Grid, CashRegister } from '../../types';
import { GRID_SIZE } from '../../types';
import { isValidPlacement, getValidCells, occupiedCount } from '../validation';

function emptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null),
  );
}

const cash: CashRegister = { kind: 'cash' };

describe('isValidPlacement', () => {
  it('returns false for out-of-bounds', () => {
    const grid = emptyGrid();
    grid[0][0] = cash;
    expect(isValidPlacement(grid, -1, 0)).toBe(false);
    expect(isValidPlacement(grid, 0, 4)).toBe(false);
  });

  it('returns false for occupied cell', () => {
    const grid = emptyGrid();
    grid[0][0] = cash;
    expect(isValidPlacement(grid, 0, 0)).toBe(false);
  });

  it('returns true for cell adjacent to occupied', () => {
    const grid = emptyGrid();
    grid[1][1] = cash;
    expect(isValidPlacement(grid, 0, 1)).toBe(true);
    expect(isValidPlacement(grid, 1, 0)).toBe(true);
    expect(isValidPlacement(grid, 1, 2)).toBe(true);
    expect(isValidPlacement(grid, 2, 1)).toBe(true);
  });

  it('returns false for non-adjacent cell', () => {
    const grid = emptyGrid();
    grid[0][0] = cash;
    expect(isValidPlacement(grid, 2, 2)).toBe(false);
    expect(isValidPlacement(grid, 0, 2)).toBe(false);
  });
});

describe('getValidCells', () => {
  it('returns all 16 cells for empty grid', () => {
    const grid = emptyGrid();
    const cells = getValidCells(grid);
    expect(cells).toHaveLength(16);
  });

  it('returns adjacent cells when cash is placed', () => {
    const grid = emptyGrid();
    grid[0][0] = cash;
    const cells = getValidCells(grid);
    // (0,1) and (1,0) are adjacent
    expect(cells).toHaveLength(2);
    expect(cells).toContainEqual([0, 1]);
    expect(cells).toContainEqual([1, 0]);
  });

  it('returns correct cells for center placement', () => {
    const grid = emptyGrid();
    grid[2][2] = cash;
    const cells = getValidCells(grid);
    // 4 adjacent cells
    expect(cells).toHaveLength(4);
  });
});

describe('occupiedCount', () => {
  it('returns 0 for empty grid', () => {
    expect(occupiedCount(emptyGrid())).toBe(0);
  });

  it('counts occupied cells', () => {
    const grid = emptyGrid();
    grid[0][0] = cash;
    grid[0][1] = cash;
    expect(occupiedCount(grid)).toBe(2);
  });
});
