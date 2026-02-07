import { useState, useCallback } from 'react';
import type { Tile, GridPos, ToyCategory } from '../game/types';
import { TurnStep, GamePhase } from '../game/types';
import { GameBoard } from './GameBoard';
import { Market } from './Market';
import { ScorePanel } from './ScorePanel';
import { createSinglePlayerGame, pickTileFromMarket, placeTile, endTurn } from '../game/state';
import { calculateFinalScore, determineMajorityAwards } from '../game/scoring';

export function GameScreen() {
  const [gameState, setGameState] = useState(() => createSinglePlayerGame());
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [selectedMarketIndex, setSelectedMarketIndex] = useState<number | null>(null);
  const [lastScore, setLastScore] = useState<{ total: number; regionScores: { category: ToyCategory; cells: number }[] } | null>(null);
  const [message, setMessage] = useState<string>('Выберите карточку с витрины');

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const handleSelectMarketTile = useCallback((index: number) => {
    if (gameState.turnStep !== TurnStep.PickTile) return;
    const result = pickTileFromMarket(gameState, index);
    setGameState(result.state);
    setSelectedTile(result.tile);
    setSelectedMarketIndex(index);
    setMessage('Перетащите или нажмите на подсвеченное место на доске');
  }, [gameState]);

  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    if (gameState.turnStep !== TurnStep.PickTile && gameState.turnStep !== TurnStep.PlaceTile) return;

    if (gameState.turnStep === TurnStep.PickTile) {
      const result = pickTileFromMarket(gameState, index);
      setGameState(result.state);
      setSelectedTile(result.tile);
      setSelectedMarketIndex(index);
    }

    e.dataTransfer.effectAllowed = 'move';
    // Use a transparent drag image
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
    setMessage('Перетащите на подсвеченное место');
  }, [gameState]);

  const handlePlaceTile = useCallback((pos: GridPos) => {
    if (!selectedTile || gameState.turnStep !== TurnStep.PlaceTile) return;

    const result = placeTile(gameState, selectedTile, pos);
    setGameState(result.state);
    setSelectedTile(null);
    setSelectedMarketIndex(null);
    setLastScore({ total: result.score, regionScores: result.regionScores });

    if (result.score > 0) {
      setMessage(`+${result.score} монет! Нажмите "Далее" для следующего хода`);
    } else {
      setMessage('Нет очков за этот ход. Нажмите "Далее"');
    }
  }, [gameState, selectedTile]);

  const handleEndTurn = useCallback(() => {
    const newState = endTurn(gameState);
    setGameState(newState);
    setLastScore(null);

    if (newState.phase === GamePhase.Ended) {
      // Apply majority awards
      const majorityAwards = determineMajorityAwards(newState.players);
      const updatedPlayers = newState.players.map(p => ({
        ...p,
        awards: [...p.awards, ...(majorityAwards.get(p.id) ?? [])],
      }));
      setGameState({ ...newState, players: updatedPlayers });
      const finalScore = calculateFinalScore(updatedPlayers[0]);
      setMessage(`Игра окончена! Финальный счёт: ${finalScore} монет`);
    } else {
      setMessage('Выберите карточку с витрины');
    }
  }, [gameState]);

  const handleNewGame = useCallback(() => {
    setGameState(createSinglePlayerGame());
    setSelectedTile(null);
    setSelectedMarketIndex(null);
    setLastScore(null);
    setMessage('Выберите карточку с витрины');
  }, []);

  const isGameOver = gameState.phase === GamePhase.Ended;

  return (
    <div
      className="game-screen"
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 16,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, color: '#333' }}>Мой Магазин Игрушек</h1>
      </header>

      {/* Status message */}
      <div
        style={{
          textAlign: 'center',
          padding: '8px 16px',
          backgroundColor: '#fff',
          borderRadius: 8,
          marginBottom: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          fontSize: 14,
          color: '#555',
        }}
      >
        {message}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Main area: board + market */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <GameBoard
            board={currentPlayer.board}
            selectedTile={selectedTile}
            onPlaceTile={handlePlaceTile}
            disabled={gameState.turnStep !== TurnStep.PlaceTile || isGameOver}
          />

          <div style={{ marginTop: 16, width: '100%' }}>
            <Market
              tiles={gameState.market}
              selectedIndex={selectedMarketIndex}
              onSelect={handleSelectMarketTile}
              onDragStart={handleDragStart}
              disabled={gameState.turnStep !== TurnStep.PickTile || isGameOver}
            />
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            {gameState.turnStep === TurnStep.ScoreShown && !isGameOver && (
              <button
                onClick={handleEndTurn}
                style={{
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Далее
              </button>
            )}
            {isGameOver && (
              <button
                onClick={handleNewGame}
                style={{
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: '#2196F3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Новая игра
              </button>
            )}
          </div>

          {/* Last score info */}
          {lastScore && lastScore.total > 0 && (
            <div
              style={{
                marginTop: 8,
                padding: '6px 12px',
                backgroundColor: '#E8F5E9',
                borderRadius: 8,
                fontSize: 13,
                color: '#2E7D32',
              }}
            >
              +{lastScore.total} монет
              {lastScore.regionScores.length > 0 && (
                <span style={{ marginLeft: 4 }}>
                  ({lastScore.regionScores.map((rs, i) => (
                    <span key={i}>
                      {i > 0 ? ' + ' : ''}{rs.cells} {rs.category}
                    </span>
                  ))})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div>
          <ScorePanel
            player={currentPlayer}
            deckRemaining={gameState.deck.length}
          />
        </div>
      </div>
    </div>
  );
}
