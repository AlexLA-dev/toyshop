/* ── Colour / Direction primitives ── */

export type ToyColor = 'red' | 'blue' | 'green' | 'yellow';

export type Direction = 'N' | 'E' | 'S' | 'W';

export const OPPOSITE: Record<Direction, Direction> = {
  N: 'S',
  S: 'N',
  E: 'W',
  W: 'E',
};

export const DIR_DELTA: Record<Direction, [number, number]> = {
  N: [-1, 0],
  S: [1, 0],
  E: [0, 1],
  W: [0, -1],
};

export const ALL_DIRECTIONS: Direction[] = ['N', 'E', 'S', 'W'];

/* ── Cards ── */

export interface ToyCard {
  id: string;
  /** Colour on each edge */
  edges: Record<Direction, ToyColor>;
  /** How many toys of each colour this card contains */
  toys: Partial<Record<ToyColor, number>>;
}

export interface CashRegister {
  kind: 'cash';
}

export type CellContent = ToyCard | CashRegister | null;

export function isToyCard(cell: CellContent): cell is ToyCard {
  return cell !== null && 'edges' in cell;
}

export function isCash(cell: CellContent): cell is CashRegister {
  return cell !== null && 'kind' in cell && cell.kind === 'cash';
}

/* ── Grid ── */

export const GRID_SIZE = 4;

export type Grid = CellContent[][];

/* ── Score event ── */

export interface ColorScore {
  color: ToyColor;
  zoneSize: number;
  coins: number;
}

export interface PlacementResult {
  scores: ColorScore[];
  totalCoins: number;
  isMultiCombo: boolean;
}

/* ── Game phases ── */

export type GamePhase =
  | 'place_cash'
  | 'select_card'
  | 'place_card'
  | 'scoring'
  | 'game_over';

export type TutorialStep =
  | 'place_cash'
  | 'select_card'
  | 'place_card'
  | 'combo_explain'
  | 'goal'
  | 'done';

/* ── Game state ── */

export interface PlayerState {
  grid: Grid;
  coins: number;
  moneyTokens: number;
}

export interface GameState {
  phase: GamePhase;
  player: PlayerState;
  deck: ToyCard[];
  market: ToyCard[];
  selectedCard: ToyCard | null;
  validCells: [number, number][];
  lastPlacement: PlacementResult | null;
  turnNumber: number;
  tutorialStep: TutorialStep;
  showTutorial: boolean;
  matchStartTime: number;
  firstScoreTime: number | null;
}
