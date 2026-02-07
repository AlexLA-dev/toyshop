import { useState, useCallback } from 'react';
import type { Tile, GridPos } from '../game/types';
import { TurnStep, GamePhase } from '../game/types';
import { GameBoard } from './GameBoard';
import { Market } from './Market';
import { ScoreBar } from './ScorePanel';
import { createSinglePlayerGame, pickTileFromMarket, placeTile, endTurn } from '../game/state';
import { calculateFinalScore, determineMajorityAwards } from '../game/scoring';

export function GameScreen() {
  const [gameState, setGameState] = useState(() => createSinglePlayerGame());
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [selectedMarketIndex, setSelectedMarketIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('\ud83c\udf6c \u0412\u044b\u0431\u0435\u0440\u0438 \u0441\u043b\u0430\u0434\u043e\u0441\u0442\u044c \u0441\u043d\u0438\u0437\u0443');

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isGameOver = gameState.phase === GamePhase.Ended;

  const handleSelectMarketTile = useCallback((index: number) => {
    if (gameState.turnStep !== TurnStep.PickTile) return;
    const result = pickTileFromMarket(gameState, index);
    setGameState(result.state);
    setSelectedTile(result.tile);
    setSelectedMarketIndex(index);
    setMessage('\ud83d\udc46 \u041f\u043e\u0441\u0442\u0430\u0432\u044c \u043d\u0430 \u043f\u043e\u0434\u0441\u0432\u0435\u0447\u0435\u043d\u043d\u043e\u0435 \u043c\u0435\u0441\u0442\u043e');
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
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
    setMessage('\ud83d\udc46 \u041f\u0435\u0440\u0435\u0442\u0430\u0449\u0438 \u043d\u0430 \u0434\u043e\u0441\u043a\u0443');
  }, [gameState]);

  const handlePlaceTile = useCallback((pos: GridPos) => {
    if (!selectedTile || gameState.turnStep !== TurnStep.PlaceTile) return;
    const result = placeTile(gameState, selectedTile, pos);
    setGameState(result.state);
    setSelectedTile(null);
    setSelectedMarketIndex(null);

    if (result.score > 0) {
      setMessage(`+${result.score} \ud83e\ude99`);
    } else {
      setMessage('\ud83d\ude10 0 \u043e\u0447\u043a\u043e\u0432');
    }
  }, [gameState, selectedTile]);

  const handleEndTurn = useCallback(() => {
    const newState = endTurn(gameState);
    setGameState(newState);

    if (newState.phase === GamePhase.Ended) {
      const majorityAwards = determineMajorityAwards(newState.players);
      const updatedPlayers = newState.players.map(p => ({
        ...p,
        awards: [...p.awards, ...(majorityAwards.get(p.id) ?? [])],
      }));
      setGameState({ ...newState, players: updatedPlayers });
      const finalScore = calculateFinalScore(updatedPlayers[0]);
      setMessage(`\ud83c\udfc6 \u0418\u0442\u043e\u0433\u043e: ${finalScore} \u043c\u043e\u043d\u0435\u0442!`);
    } else {
      setMessage('\ud83c\udf6c \u0412\u044b\u0431\u0435\u0440\u0438 \u0441\u043b\u0430\u0434\u043e\u0441\u0442\u044c \u0441\u043d\u0438\u0437\u0443');
    }
  }, [gameState]);

  const handleNewGame = useCallback(() => {
    setGameState(createSinglePlayerGame());
    setSelectedTile(null);
    setSelectedMarketIndex(null);

    setMessage('\ud83c\udf6c \u0412\u044b\u0431\u0435\u0440\u0438 \u0441\u043b\u0430\u0434\u043e\u0441\u0442\u044c \u0441\u043d\u0438\u0437\u0443');
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Top score bar */}
      <ScoreBar player={currentPlayer} deckRemaining={gameState.deck.length} message={message} />

      {/* Board — centered */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px' }}>
        <GameBoard
          board={currentPlayer.board}
          selectedTile={selectedTile}
          onPlaceTile={handlePlaceTile}
          disabled={gameState.turnStep !== TurnStep.PlaceTile || isGameOver}
        />

        {/* Action buttons */}
        <div style={{ marginTop: 10, display: 'flex', gap: 8, minHeight: 44 }}>
          {gameState.turnStep === TurnStep.ScoreShown && !isGameOver && (
            <button onClick={handleEndTurn} style={btnStyle('#4CAF50')}>
              \u0414\u0430\u043b\u0435\u0435 \u27a1\ufe0f
            </button>
          )}
          {isGameOver && (
            <button onClick={handleNewGame} style={btnStyle('#2196F3')}>
              \ud83d\udd04 \u041d\u043e\u0432\u0430\u044f \u0438\u0433\u0440\u0430
            </button>
          )}
        </div>
      </div>

      {/* Bottom: market */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #eee',
        padding: '8px 12px',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}>
        <Market
          tiles={gameState.market}
          selectedIndex={selectedMarketIndex}
          onSelect={handleSelectMarketTile}
          onDragStart={handleDragStart}
          disabled={gameState.turnStep !== TurnStep.PickTile || isGameOver}
        />
      </div>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '10px 24px',
    fontSize: 15,
    fontWeight: 600,
    backgroundColor: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  };
}
