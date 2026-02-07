import type { GameState, Player, Tile, GridPos, Award } from './types';
import { GamePhase, TurnStep, ToyCategory, AwardType } from './types';
import { generateDeck, generateStarterTiles } from './tiles';
import { calculatePlacementScore, checkDiversityAward } from './scoring';

/** Create the initial game state for a given number of players */
export function createGameState(playerCount: number): GameState {
  const deck = generateDeck();
  const starters = generateStarterTiles();

  const players: Player[] = [];
  for (let i = 0; i < playerCount; i++) {
    const board: (Tile | null)[][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => null)
    );
    // Place starter tile in a central position (row 1, col 1 — gives room to expand)
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

  // Draw 4 cards for the market
  const market = deck.splice(0, 4);

  return {
    phase: GamePhase.Playing,
    players,
    currentPlayerIndex: 0,
    deck,
    market,
    diversityAwardsTaken: {
      [ToyCategory.Plush]: false,
      [ToyCategory.Dolls]: false,
      [ToyCategory.Vehicles]: false,
      [ToyCategory.Sports]: false,
    },
    turnStep: TurnStep.PickTile,
  };
}

/** Create a single-player game (for MVP/tutorial) */
export function createSinglePlayerGame(): GameState {
  return createGameState(1);
}

/** Pick a tile from the market (Step 1 of turn) */
export function pickTileFromMarket(state: GameState, marketIndex: number): { state: GameState; tile: Tile } {
  const tile = state.market[marketIndex];
  const newMarket = [...state.market];
  newMarket.splice(marketIndex, 1);

  return {
    state: {
      ...state,
      market: newMarket,
      turnStep: TurnStep.PlaceTile,
    },
    tile,
  };
}

/** Place a tile on the board (Step 2 of turn) — returns score earned */
export function placeTile(
  state: GameState,
  tile: Tile,
  pos: GridPos
): { state: GameState; score: number; regionScores: { category: ToyCategory; cells: number }[] } {
  const player = state.players[state.currentPlayerIndex];
  const board = player.board.map(row => [...row]);
  const scoreResult = calculatePlacementScore(board, tile, pos);

  // Place the tile
  board[pos.row][pos.col] = tile;

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
      diversityAwardsTaken,
      turnStep: TurnStep.ScoreShown,
    },
    score: scoreResult.total,
    regionScores: scoreResult.regionScores,
  };
}

/** End the current turn: draw a new card for market, advance to next player */
export function endTurn(state: GameState): GameState {
  // Refill market from deck
  const newMarket = [...state.market];
  while (newMarket.length < 4 && state.deck.length > 0) {
    const newDeck = [...state.deck];
    newMarket.push(newDeck.shift()!);
    state = { ...state, deck: newDeck };
  }

  // Check if game is over (all players have 4×4 = 16 tiles, but starter takes 1 slot, so 15 more)
  const currentPlayer = state.players[state.currentPlayerIndex];
  const filledSlots = currentPlayer.board.flat().filter(t => t !== null).length;

  // In single player, check if board is full
  if (filledSlots >= 16) {
    return {
      ...state,
      market: newMarket,
      phase: GamePhase.Ended,
    };
  }

  // Next player
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    market: newMarket,
    currentPlayerIndex: nextPlayerIndex,
    turnStep: TurnStep.PickTile,
  };
}

/** Check if the board is complete (4×4 filled) */
export function isBoardComplete(player: Player): boolean {
  return player.board.flat().filter(t => t !== null).length >= 16;
}
