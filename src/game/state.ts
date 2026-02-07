import type {
  GameState,
  PlayerState,
  Grid,
  ToyCard,
  CashRegister,
  TutorialStep,
} from '../types';
import { GRID_SIZE } from '../types';
import { FULL_DECK, shuffleDeck } from './cards';
import { getValidCells } from './validation';
import { calculatePlacement } from './scoring';
import { trackEvent } from '../analytics';

/* ── Helpers ── */

function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null),
  );
}

function createPlayer(): PlayerState {
  return {
    grid: createEmptyGrid(),
    coins: 0,
    moneyTokens: 0,
  };
}

function drawMarket(deck: ToyCard[]): { market: ToyCard[]; remaining: ToyCard[] } {
  const market = deck.slice(0, 4);
  const remaining = deck.slice(4);
  return { market, remaining };
}

/* ── Initial state ── */

export function createInitialState(): GameState {
  const shuffled = shuffleDeck(FULL_DECK);
  const { market, remaining } = drawMarket(shuffled);

  const now = Date.now();
  trackEvent({ type: 'match_start', mode: 'solo', players: 1 });

  return {
    phase: 'place_cash',
    player: createPlayer(),
    deck: remaining,
    market,
    selectedCard: null,
    validCells: [], // All cells valid for cash
    lastPlacement: null,
    turnNumber: 0,
    tutorialStep: 'place_cash',
    showTutorial: true,
    matchStartTime: now,
    firstScoreTime: null,
  };
}

/* ── Actions ── */

export type GameAction =
  | { type: 'PLACE_CASH'; row: number; col: number }
  | { type: 'SELECT_CARD'; card: ToyCard }
  | { type: 'PLACE_CARD'; row: number; col: number }
  | { type: 'DISMISS_SCORE' }
  | { type: 'ADVANCE_TUTORIAL' }
  | { type: 'RESTART' };

/* ── Reducer ── */

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_CASH': {
      if (state.phase !== 'place_cash') return state;
      const { row, col } = action;
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return state;

      const newGrid = state.player.grid.map((r) => [...r]);
      const cash: CashRegister = { kind: 'cash' };
      newGrid[row][col] = cash;

      const validCells = getValidCells(newGrid);

      trackEvent({ type: 'placement_commit', cardId: 'cash', cell: [row, col] });

      return {
        ...state,
        phase: 'select_card',
        player: { ...state.player, grid: newGrid },
        validCells,
        tutorialStep: state.showTutorial ? 'select_card' : state.tutorialStep,
      };
    }

    case 'SELECT_CARD': {
      if (state.phase !== 'select_card') return state;
      const { card } = action;
      if (!state.market.find((m) => m.id === card.id)) return state;

      const validCells = getValidCells(state.player.grid);

      trackEvent({
        type: 'market_card_select',
        cardId: card.id,
        marketIndex: state.market.findIndex((m) => m.id === card.id),
      });

      return {
        ...state,
        phase: 'place_card',
        selectedCard: card,
        validCells,
        tutorialStep: state.showTutorial ? 'place_card' : state.tutorialStep,
      };
    }

    case 'PLACE_CARD': {
      if (state.phase !== 'place_card' || !state.selectedCard) return state;
      const { row, col } = action;

      // Validate
      const isValid = state.validCells.some(([r, c]) => r === row && c === col);
      trackEvent({ type: 'placement_attempt', cell: [row, col], valid: isValid });

      if (!isValid) return state;

      // Place card
      const newGrid = state.player.grid.map((r) => [...r]);
      newGrid[row][col] = state.selectedCard;

      trackEvent({
        type: 'placement_commit',
        cardId: state.selectedCard.id,
        cell: [row, col],
      });

      // Score
      const result = calculatePlacement(newGrid, row, col);

      // Update coins
      let newCoins = state.player.coins + result.totalCoins;
      let newTokens = state.player.moneyTokens;
      while (newCoins >= 10) {
        newCoins -= 10;
        newTokens += 1;
      }

      // Track score
      if (result.totalCoins > 0) {
        const byColor: Record<string, number> = {};
        for (const s of result.scores) {
          byColor[s.color] = s.coins;
        }
        trackEvent({
          type: 'score_gain',
          totalGained: result.totalCoins,
          byColor,
          multiColorCombo: result.isMultiCombo,
        });
      }

      // Update market: remove selected, draw replacement
      const newMarket = state.market.filter((m) => m.id !== state.selectedCard!.id);
      let newDeck = [...state.deck];
      if (newDeck.length > 0) {
        newMarket.push(newDeck[0]);
        newDeck = newDeck.slice(1);
      }

      const newTurnNumber = state.turnNumber + 1;
      const totalCells = GRID_SIZE * GRID_SIZE;
      // Grid is full when all 16 cells occupied (1 cash + 15 cards)
      let occupiedCount = 0;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (newGrid[r][c] !== null) occupiedCount++;
        }
      }

      const isGameOver = occupiedCount >= totalCells || (newMarket.length === 0 && newDeck.length === 0);

      const firstScoreTime =
        state.firstScoreTime === null && result.totalCoins > 0
          ? Date.now()
          : state.firstScoreTime;

      let tutorialStep: TutorialStep = state.tutorialStep;
      if (state.showTutorial) {
        if (result.totalCoins > 0 && state.tutorialStep === 'place_card') {
          tutorialStep = 'combo_explain';
        } else if (state.tutorialStep === 'place_card') {
          tutorialStep = 'goal';
        }
      }

      return {
        ...state,
        phase: result.totalCoins > 0 ? 'scoring' : isGameOver ? 'game_over' : 'select_card',
        player: {
          grid: newGrid,
          coins: newCoins,
          moneyTokens: newTokens,
        },
        deck: newDeck,
        market: newMarket,
        selectedCard: null,
        validCells: [],
        lastPlacement: result.totalCoins > 0 ? result : null,
        turnNumber: newTurnNumber,
        firstScoreTime,
        tutorialStep,
      };
    }

    case 'DISMISS_SCORE': {
      if (state.phase !== 'scoring') return state;

      // Check game over
      let occupiedCount = 0;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (state.player.grid[r][c] !== null) occupiedCount++;
        }
      }
      const totalCells = GRID_SIZE * GRID_SIZE;
      const isGameOver =
        occupiedCount >= totalCells || (state.market.length === 0 && state.deck.length === 0);

      if (isGameOver) {
        const duration = Date.now() - state.matchStartTime;
        const totalScore = state.player.moneyTokens * 10 + state.player.coins;
        trackEvent({
          type: 'match_end',
          score: totalScore,
          duration,
          mode: 'solo',
        });
      }

      let tutorialStep: TutorialStep = state.tutorialStep;
      if (state.showTutorial && state.tutorialStep === 'combo_explain') {
        tutorialStep = 'goal';
      }

      return {
        ...state,
        phase: isGameOver ? 'game_over' : 'select_card',
        lastPlacement: null,
        tutorialStep,
      };
    }

    case 'ADVANCE_TUTORIAL': {
      const steps: TutorialStep[] = [
        'place_cash',
        'select_card',
        'place_card',
        'combo_explain',
        'goal',
        'done',
      ];
      const idx = steps.indexOf(state.tutorialStep);
      const next = idx < steps.length - 1 ? steps[idx + 1] : 'done';
      return {
        ...state,
        tutorialStep: next,
        showTutorial: next !== 'done',
      };
    }

    case 'RESTART': {
      return createInitialState();
    }

    default:
      return state;
  }
}
