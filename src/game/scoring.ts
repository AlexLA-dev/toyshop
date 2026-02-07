import type {
  Grid,
  ToyColor,
  PlacementResult,
  ColorScore,
  Direction,
} from '../types';
import { isToyCard, isCash, ALL_DIRECTIONS, DIR_DELTA, OPPOSITE, GRID_SIZE } from '../types';

const ALL_COLORS: ToyColor[] = ['red', 'blue', 'green', 'yellow'];

/**
 * Check if two adjacent cells are connected for a given colour.
 *
 * Connection rules:
 * - ToyCard ↔ ToyCard: edge colours must match on the shared side
 * - ToyCard ↔ Cash: cash conducts any colour, so always connects
 * - Cash ↔ Cash: not possible (only 1 cash register)
 */
function areConnected(
  grid: Grid,
  r1: number,
  c1: number,
  dir: Direction,
  color: ToyColor,
): boolean {
  const [dr, dc] = DIR_DELTA[dir];
  const r2 = r1 + dr;
  const c2 = c1 + dc;

  if (r2 < 0 || r2 >= GRID_SIZE || c2 < 0 || c2 >= GRID_SIZE) return false;

  const cell1 = grid[r1][c1];
  const cell2 = grid[r2][c2];

  if (cell1 === null || cell2 === null) return false;

  // Cash register conducts all colours
  const cell1MatchesColor = isCash(cell1) || (isToyCard(cell1) && cell1.edges[dir] === color);
  const cell2MatchesColor =
    isCash(cell2) || (isToyCard(cell2) && cell2.edges[OPPOSITE[dir]] === color);

  return cell1MatchesColor && cell2MatchesColor;
}

/**
 * BFS to find the connected component of a given colour starting from (startR, startC).
 * Returns the set of cells in the component (as "r,c" strings).
 */
function findColorZone(
  grid: Grid,
  startR: number,
  startC: number,
  color: ToyColor,
): Set<string> {
  const visited = new Set<string>();
  const queue: [number, number][] = [[startR, startC]];
  const key = (r: number, c: number) => `${r},${c}`;

  visited.add(key(startR, startC));

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    for (const dir of ALL_DIRECTIONS) {
      const [dr, dc] = DIR_DELTA[dir];
      const nr = r + dr;
      const nc = c + dc;
      const nk = key(nr, nc);

      if (visited.has(nk)) continue;
      if (!areConnected(grid, r, c, dir, color)) continue;

      visited.add(nk);
      queue.push([nr, nc]);
    }
  }

  return visited;
}

/**
 * Count toys of a given colour in a zone.
 */
function countToysInZone(grid: Grid, zone: Set<string>, color: ToyColor): number {
  let count = 0;
  for (const cellKey of zone) {
    const [r, c] = cellKey.split(',').map(Number);
    const cell = grid[r][c];
    if (isToyCard(cell)) {
      count += cell.toys[color] ?? 0;
    }
  }
  return count;
}

/**
 * Calculate coins earned from placing a card at (row, col).
 *
 * For each colour:
 * 1. Check if the new card creates at least one connection of that colour
 *    with an adjacent occupied cell.
 * 2. If yes, BFS the full connected zone for that colour.
 * 3. Sum all toys of that colour in the zone → that many coins.
 */
export function calculatePlacement(
  grid: Grid,
  row: number,
  col: number,
): PlacementResult {
  const scores: ColorScore[] = [];
  let totalCoins = 0;

  for (const color of ALL_COLORS) {
    // Check if the new card at (row, col) connects to any neighbour for this colour
    let hasConnection = false;
    for (const dir of ALL_DIRECTIONS) {
      if (areConnected(grid, row, col, dir, color)) {
        hasConnection = true;
        break;
      }
    }

    if (!hasConnection) continue;

    // BFS the zone
    const zone = findColorZone(grid, row, col, color);

    // Only count if zone has more than just the placed card
    if (zone.size <= 1) {
      // Single card doesn't score (no connection formed a zone)
      // Actually — the card IS connected to at least one neighbour, so zone >= 2
      // But toys might be 0 if only cash is involved
    }

    const coins = countToysInZone(grid, zone, color);
    if (coins > 0) {
      scores.push({ color, zoneSize: zone.size, coins });
      totalCoins += coins;
    }
  }

  const isMultiCombo = scores.length >= 2;

  return { scores, totalCoins, isMultiCombo };
}
