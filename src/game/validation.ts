import type { Grid } from '../types';
import { GRID_SIZE } from '../types';

/**
 * Check if placing a card at (row, col) is valid.
 *
 * Rules:
 * - Cell must be empty
 * - Card must have at least one orthogonal neighbour that is occupied
 *   (except for the very first card after cash, which always has the cash as reference)
 */
export function isValidPlacement(grid: Grid, row: number, col: number): boolean {
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false;
  if (grid[row][col] !== null) return false;

  // Must be adjacent to at least one occupied cell
  const neighbours: [number, number][] = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];

  return neighbours.some(([r, c]) => {
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
    return grid[r][c] !== null;
  });
}

/**
 * Get all valid cells for placement on the current grid.
 */
export function getValidCells(grid: Grid): [number, number][] {
  const cells: [number, number][] = [];

  // Check if the grid has any occupied cells
  let hasOccupied = false;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== null) {
        hasOccupied = true;
        break;
      }
    }
    if (hasOccupied) break;
  }

  // If no occupied cells (shouldn't happen after cash is placed), all cells valid
  if (!hasOccupied) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        cells.push([r, c]);
      }
    }
    return cells;
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (isValidPlacement(grid, r, c)) {
        cells.push([r, c]);
      }
    }
  }
  return cells;
}

/**
 * Count occupied cells in grid.
 */
export function occupiedCount(grid: Grid): number {
  let count = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== null) count++;
    }
  }
  return count;
}
