import type { GameState, Player, GridPos, Award } from './types';
import { GamePhase, TurnStep, ToyCategory, AwardType } from './types';
import { generateDeck, generateStarterTiles, generateTutorialMarket, generateTutorialDeck } from './tiles';
import { calculatePlacementScore, checkDiversityAward } from './scoring';

function emptyDiversityMap(): Record<ToyCategory, boolean> {
  return {
    [ToyCategory.Bakery]: false,
    [ToyCategory.IceCream]: false,
    [ToyCategory.Pies]: false,
    [ToyCategory.Candy]: false,
  };
}

/** Create the initial game state for a given number of players */
export function createGameState(playerCount: number): GameState {
  const deck = generateDeck();
  const starters = generateStarterTiles();

  const players: Player[] = [];
  for (let i = 0; i < playerCount; i++) {
    const board: (Tile | null)[][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => null)
    );
    const starterPos: GridPos = { row: 1, col: 1 };
    board[starterPos.row][starterPos.col] = starters[i];

    players.push({
      id: `player_${i}`,
      name: `Игрок ${i + 1}`,
      coins: 0,
      moneyTokens: 0,
      awards: [],
      board,
      starterPos,
    });
  }

  const market = deck.splice(0, 4);

  return {
    phase: GamePhase.Playing,
    players,
    currentPlayerIndex: 0,
    deck,
    market,
    diversityAwardsTaken: emptyDiversityMap(),
    turnStep: TurnStep.PickTile,
  };
}

// Need Tile type for the board array
import type { Tile } from './types';

/** Create a single-player game */
export function createSinglePlayerGame(): GameState {
  return createGameState(1);
}

/** Create a tutorial game with scripted market tiles */
export function createTutorialGame(): GameState {
  const deck = generateTutorialDeck();
  const starters = generateStarterTiles();

  const board: (Tile | null)[][] = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => null)
  );
  const starterPos: GridPos = { row: 1, col: 1 };
  board[starterPos.row][starterPos.col] = starters[0];

  const players: Player[] = [{
    id: 'player_0',
    name: 'Игрок 1',
    coins: 0,
    moneyTokens: 0,
    awards: [],
    board,
    starterPos,
  }];

  const market = generateTutorialMarket();

  return {
    phase: GamePhase.Playing,
    players,
    currentPlayerIndex: 0,
    deck,
    market,
    diversityAwardsTaken: emptyDiversityMap(),
    turnStep: TurnStep.PickTile,
  };
}

/**
 * Place a tile from the market onto the board.
 * Removes tile from market and draws a replacement from deck.
 * Selection is handled in the UI — this function does the commit.
 */
export function placeTile(
  state: GameState,
  marketIndex: number,
  pos: GridPos
): { state: GameState; score: number; regionScores: { category: ToyCategory; cells: number }[] } {
  const tile = state.market[marketIndex];
  const player = state.players[state.currentPlayerIndex];
  const board = player.board.map(row => [...row]);
  const scoreResult = calculatePlacementScore(board, tile, pos);

  // Place the tile on the board
  board[pos.row][pos.col] = tile;

  // Remove from market and draw replacement
  const newMarket = state.market.filter((_, i) => i !== marketIndex);
  const newDeck = [...state.deck];
  if (newDeck.length > 0) {
    newMarket.push(newDeck.shift()!);
  }

  // Update coins
  let coins = player.coins + scoreResult.total;
  let moneyTokens = player.moneyTokens;
  while (coins >= 10) {
    coins -= 10;
    moneyTokens++;
  }

  // Check diversity awards
  const newAwards: Award[] = [...player.awards];
  const diversityAwardsTaken = { ...state.diversityAwardsTaken };
  for (const category of Object.values(ToyCategory)) {
    if (!diversityAwardsTaken[category]) {
      const updatedPlayer = { ...player, board };
      if (checkDiversityAward(updatedPlayer, category)) {
        diversityAwardsTaken[category] = true;
        newAwards.push({ type: AwardType.Diversity, category, value: 5 });
      }
    }
  }

  const updatedPlayer: Player = {
    ...player,
    board,
    coins,
    moneyTokens,
    awards: newAwards,
  };

  const newPlayers = [...state.players];
  newPlayers[state.currentPlayerIndex] = updatedPlayer;

  return {
    state: {
      ...state,
      players: newPlayers,
      deck: newDeck,
      market: newMarket,
      diversityAwardsTaken,
      turnStep: TurnStep.ScoreShown,
    },
    score: scoreResult.total,
    regionScores: scoreResult.regionScores,
  };
}

/** End the current turn: advance to next player (market already refilled on place) */
export function endTurn(state: GameState): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const filledSlots = currentPlayer.board.flat().filter(t => t !== null).length;

  if (filledSlots >= 16) {
    return {
      ...state,
      phase: GamePhase.Ended,
    };
  }

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    currentPlayerIndex: nextPlayerIndex,
    turnStep: TurnStep.PickTile,
  };
}

/** Check if the board is complete (4×4 filled) */
export function isBoardComplete(player: Player): boolean {
  return player.board.flat().filter(t => t !== null).length >= 16;
}
