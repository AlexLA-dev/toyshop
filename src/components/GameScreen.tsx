import { useState, useCallback } from 'react';
import type { Tile, GridPos } from '../game/types';
import { TurnStep, GamePhase } from '../game/types';
import type { TutorialAction } from './Tutorial';
import { GameBoard } from './GameBoard';
import { Market } from './Market';
import { ScoreBar } from './ScorePanel';
import { createSinglePlayerGame, pickTileFromMarket, placeTile, endTurn } from '../game/state';
import { calculateFinalScore, determineMajorityAwards } from '../game/scoring';

interface GameScreenProps {
  tutorialTarget: 'market' | 'board' | 'scorebar' | 'none' | null;
  onTutorialAction: (action: TutorialAction) => void;
}

export function GameScreen({ tutorialTarget, onTutorialAction }: GameScreenProps) {
  const [gameState, setGameState] = useState(() => createSinglePlayerGame());
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [selectedMarketIndex, setSelectedMarketIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('🍬 Выбери сладость снизу');

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isGameOver = gameState.phase === GamePhase.Ended;

  const handleSelectMarketTile = useCallback((index: number) => {
    if (gameState.turnStep !== TurnStep.PickTile) return;
    const result = pickTileFromMarket(gameState, index);
    setGameState(result.state);
    setSelectedTile(result.tile);
    setSelectedMarketIndex(index);
    setMessage('👆 Поставь на подсвеченное место');
    onTutorialAction('pick_tile');
  }, [gameState, onTutorialAction]);

  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    if (gameState.turnStep !== TurnStep.PickTile && gameState.turnStep !== TurnStep.PlaceTile) return;
    if (gameState.turnStep === TurnStep.PickTile) {
      const result = pickTileFromMarket(gameState, index);
      setGameState(result.state);
      setSelectedTile(result.tile);
      setSelectedMarketIndex(index);
      onTutorialAction('pick_tile');
    }
    e.dataTransfer.effectAllowed = 'move';
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
    setMessage('👆 Перетащи на доску');
  }, [gameState, onTutorialAction]);

  const handlePlaceTile = useCallback((pos: GridPos) => {
    if (!selectedTile || gameState.turnStep !== TurnStep.PlaceTile) return;
    const result = placeTile(gameState, selectedTile, pos);
    setGameState(result.state);
    setSelectedTile(null);
    setSelectedMarketIndex(null);

    if (result.score > 0) {
      setMessage(`+${result.score} 🪙`);
    } else {
      setMessage('😐 0 очков');
    }
    onTutorialAction('place_tile');
  }, [gameState, selectedTile, onTutorialAction]);

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
      setMessage(`🏆 Итого: ${finalScore} монет!`);
    } else {
      setMessage('🍬 Выбери сладость снизу');
    }
    onTutorialAction('end_turn');
  }, [gameState, onTutorialAction]);

  const handleNewGame = useCallback(() => {
    setGameState(createSinglePlayerGame());
    setSelectedTile(null);
    setSelectedMarketIndex(null);
    setMessage('🍬 Выбери сладость снизу');
  }, []);

  const highlightMarket = tutorialTarget === 'market';
  const highlightBoard = tutorialTarget === 'board';
  const highlightScorebar = tutorialTarget === 'scorebar';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Top score bar */}
      <div className={highlightScorebar ? 'tutorial-highlight' : ''}>
        <ScoreBar player={currentPlayer} deckRemaining={gameState.deck.length} message={message} />
      </div>

      {/* Board — centered */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px' }}>
        <div className={highlightBoard ? 'tutorial-highlight' : ''}>
          <GameBoard
            board={currentPlayer.board}
            selectedTile={selectedTile}
            onPlaceTile={handlePlaceTile}
            disabled={gameState.turnStep !== TurnStep.PlaceTile || isGameOver}
          />
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: 10, display: 'flex', gap: 8, minHeight: 44 }}>
          {gameState.turnStep === TurnStep.ScoreShown && !isGameOver && (
            <button onClick={handleEndTurn} style={btnStyle('#4CAF50')}>
              Далее ➡️
            </button>
          )}
          {isGameOver && (
            <button onClick={handleNewGame} style={btnStyle('#2196F3')}>
              🔄 Новая игра
            </button>
          )}
        </div>
      </div>

      {/* Bottom: market */}
      <div
        className={highlightMarket ? 'tutorial-highlight' : ''}
        style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
          padding: '8px 12px',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        }}
      >
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
