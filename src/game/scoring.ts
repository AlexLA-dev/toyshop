import type { Tile, GridPos, CellPos, Player, Award, ToyCategory } from './types';
import { AwardType, TOYS } from './types';

/**
 * Get the category at a specific cell position on a player's board.
 * Each tile occupies a 2×2 area of cells.
 * Cell (r, c) maps to tile at (floor(r/2), floor(c/2)), cell index = (r%2)*2 + (c%2).
 * Returns the category or undefined if no tile/block at that position.
 */
export function getCategoryAtCell(board: (Tile | null)[][], cellPos: CellPos): ToyCategory | null | undefined {
  const tileRow = Math.floor(cellPos.row / 2);
  const tileCol = Math.floor(cellPos.col / 2);
  if (tileRow < 0 || tileRow >= board.length) return undefined;
  if (tileCol < 0 || tileCol >= (board[0]?.length ?? 0)) return undefined;
  const tile = board[tileRow]?.[tileCol];
  if (!tile) return undefined;
  const cellIdx = (cellPos.row % 2) * 2 + (cellPos.col % 2);
  const block = tile.blocks.find(b => b.cells.includes(cellIdx));
  if (!block) return undefined;
  return block.category; // null = register
}

/**
 * Get the toy name at a specific cell position.
 */
export function getToyAtCell(board: (Tile | null)[][], cellPos: CellPos): string | undefined {
  const tileRow = Math.floor(cellPos.row / 2);
  const tileCol = Math.floor(cellPos.col / 2);
  if (tileRow < 0 || tileRow >= board.length) return undefined;
  if (tileCol < 0 || tileCol >= (board[0]?.length ?? 0)) return undefined;
  const tile = board[tileRow]?.[tileCol];
  if (!tile) return undefined;
  const cellIdx = (cellPos.row % 2) * 2 + (cellPos.col % 2);
  const block = tile.blocks.find(b => b.cells.includes(cellIdx));
  return block?.toy;
}

/**
 * Find all cells in a connected region of the same category starting from a cell.
 * Uses BFS. Register (null category) connects regions but we track it separately.
 */
export function findConnectedRegion(
  board: (Tile | null)[][],
  startCell: CellPos,
  targetCategory: ToyCategory
): { toyCells: CellPos[]; registerCells: CellPos[] } {
  const boardRows = board.length * 2;
  const boardCols = (board[0]?.length ?? 0) * 2;

  const visited = new Set<string>();
  const toyCells: CellPos[] = [];
  const registerCells: CellPos[] = [];
  const queue: CellPos[] = [startCell];
  const key = (p: CellPos) => `${p.row},${p.col}`;
  visited.add(key(startCell));

  while (queue.length > 0) {
    const cell = queue.shift()!;
    const cat = getCategoryAtCell(board, cell);

    if (cat === undefined) continue; // no tile here

    if (cat === targetCategory) {
      toyCells.push(cell);
    } else if (cat === null) {
      // Register cell - it connects but doesn't count for scoring
      registerCells.push(cell);
    } else {
      // Different category - don't traverse
      continue;
    }

    // Explore 4-connected neighbors
    const neighbors: CellPos[] = [
      { row: cell.row - 1, col: cell.col },
      { row: cell.row + 1, col: cell.col },
      { row: cell.row, col: cell.col - 1 },
      { row: cell.row, col: cell.col + 1 },
    ];
    for (const n of neighbors) {
      if (n.row < 0 || n.row >= boardRows || n.col < 0 || n.col >= boardCols) continue;
      if (visited.has(key(n))) continue;
      const nCat = getCategoryAtCell(board, n);
      if (nCat === targetCategory || nCat === null) {
        visited.add(key(n));
        queue.push(n);
      }
    }
  }

  return { toyCells, registerCells };
}

/**
 * Calculate score earned by placing a tile at a grid position.
 * Rules:
 * - Find connected regions of same color that include cells of the new tile.
 * - Count distinct TILES (not cells) in each region.
 * - A region must span at least 2 tiles to score.
 * - Score per region = tileCount × 1000.
 * - Register connects regions but doesn't count as a scoring tile.
 */
export function calculatePlacementScore(
  board: (Tile | null)[][],
  tile: Tile,
  pos: GridPos
): { total: number; regionScores: { category: ToyCategory; tiles: number }[] } {
  // Temporarily place the tile
  const tempBoard = board.map(row => [...row]);
  tempBoard[pos.row][pos.col] = tile;

  const scored = new Set<string>();
  const regionScores: { category: ToyCategory; tiles: number }[] = [];
  let total = 0;

  for (const block of tile.blocks) {
    if (block.category === null) continue; // register block doesn't score

    for (const cellIdx of block.cells) {
      const cellRow = pos.row * 2 + Math.floor(cellIdx / 2);
      const cellCol = pos.col * 2 + (cellIdx % 2);
      const cellKey = `${cellRow},${cellCol}`;
      if (scored.has(cellKey)) continue;

      // Find the full connected region
      const region = findConnectedRegion(tempBoard, { row: cellRow, col: cellCol }, block.category);

      // Mark all cells as scored so we don't double-count
      for (const tc of region.toyCells) {
        scored.add(`${tc.row},${tc.col}`);
      }

      // Count distinct tiles in the region
      const tileKeys = new Set<string>();
      for (const tc of region.toyCells) {
        tileKeys.add(`${Math.floor(tc.row / 2)},${Math.floor(tc.col / 2)}`);
      }

      // Only score if 2+ tiles in the region
      if (tileKeys.size >= 2) {
        const score = tileKeys.size * 1000;
        regionScores.push({ category: block.category, tiles: tileKeys.size });
        total += score;
      }
    }
  }

  return { total, regionScores };
}

/**
 * Get valid placement positions for a tile on a player's board.
 */
export function getValidPlacements(board: (Tile | null)[][]): GridPos[] {
  const positions: GridPos[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] !== null) continue;
      const neighbors: GridPos[] = [
        { row: r - 1, col: c },
        { row: r + 1, col: c },
        { row: r, col: c - 1 },
        { row: r, col: c + 1 },
      ];
      const hasNeighbor = neighbors.some(n =>
        n.row >= 0 && n.row < 4 && n.col >= 0 && n.col < 4 && board[n.row][n.col] !== null
      );
      if (hasNeighbor) {
        positions.push({ row: r, col: c });
      }
    }
  }
  return positions;
}

/**
 * Check if a player has earned a diversity award for a category.
 * Diversity = all 4 different items of the same category on the board.
 */
export function checkDiversityAward(player: Player, category: ToyCategory): boolean {
  const toysOfCategory = new Set<string>();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const tile = player.board[r]?.[c];
      if (!tile) continue;
      for (const block of tile.blocks) {
        if (block.category === category) {
          toysOfCategory.add(block.toy);
        }
      }
    }
  }
  return toysOfCategory.size >= 4;
}

/**
 * Count specific toy occurrences for majority awards at end of game.
 */
export function countToysByCategory(player: Player, category: ToyCategory): Map<string, number> {
  const counts = new Map<string, number>();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const tile = player.board[r]?.[c];
      if (!tile) continue;
      for (const block of tile.blocks) {
        if (block.category === category) {
          const count = block.cells.length;
          counts.set(block.toy, (counts.get(block.toy) ?? 0) + count);
        }
      }
    }
  }
  return counts;
}

/**
 * Get the maximum count of identical toys for a category across a player's board.
 */
export function getMaxIdenticalToys(player: Player, category: ToyCategory): number {
  const counts = countToysByCategory(player, category);
  let max = 0;
  for (const count of counts.values()) {
    if (count > max) max = count;
  }
  return max;
}

/**
 * Determine majority awards at end of game.
 * For each category, the player with the most identical toys of one type wins.
 */
export function determineMajorityAwards(players: Player[]): Map<string, Award[]> {
  const awards = new Map<string, Award[]>();
  for (const p of players) awards.set(p.id, []);

  const categoryKeys = Object.keys(TOYS) as ToyCategory[];

  for (const category of categoryKeys) {
    let maxCount = 0;
    const playerMaxes: { player: Player; count: number }[] = [];
    for (const player of players) {
      const count = getMaxIdenticalToys(player, category);
      playerMaxes.push({ player, count });
      if (count > maxCount) maxCount = count;
    }
    if (maxCount === 0) continue;

    const winners = playerMaxes.filter(pm => pm.count === maxCount);
    for (const w of winners) {
      awards.get(w.player.id)!.push({
        type: AwardType.Majority,
        category,
        value: 5000,
      });
    }
  }
  return awards;
}

/**
 * Calculate total final score for a player.
 * Score = coins + award bonuses.
 */
export function calculateFinalScore(player: Player): number {
  let score = player.coins;
  for (const award of player.awards) {
    score += award.value;
  }
  return score;
}
