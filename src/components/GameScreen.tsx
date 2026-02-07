import { useState, useCallback } from 'react';
import type { GameState, GridPos } from '../game/types';
import { TurnStep, GamePhase } from '../game/types';
import type { TutorialAction, TutorialStep } from './Tutorial';
import { GameBoard } from './GameBoard';
import { Market } from './Market';
import { ScoreBar } from './ScorePanel';
import { createSinglePlayerGame, placeTile, endTurn } from '../game/state';
import { calculateFinalScore, determineMajorityAwards } from '../game/scoring';

interface GameScreenProps {
  /** Current tutorial step (null = tutorial done) */
  tutorialStep: TutorialStep | null;
  onTutorialAction: (action: TutorialAction) => void;
  /** Provide an initial game state (for tutorial scripted game) */
  initialState?: GameState;
}

export function GameScreen({ tutorialStep, onTutorialAction, initialState }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(
    () => initialState ?? createSinglePlayerGame()
  );
  const [selectedMarketIndex, setSelectedMarketIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('🍬 Выбери карточку снизу');

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isGameOver = gameState.phase === GamePhase.Ended;

  // Derived: selected tile from market (tile stays in market until placed)
  const selectedTile = selectedMarketIndex !== null ? gameState.market[selectedMarketIndex] ?? null : null;

  // Can place when a tile is selected and we're in PickTile step
  const canPlace = selectedMarketIndex !== null && gameState.turnStep === TurnStep.PickTile && !isGameOver;

  const handleSelectMarketTile = useCallback((index: number) => {
    if (gameState.turnStep !== TurnStep.PickTile || isGameOver) return;

    if (selectedMarketIndex === index) {
      // Deselect
      setSelectedMarketIndex(null);
      setMessage('🍬 Выбери карточку снизу');
    } else {
      // Select (or switch)
      setSelectedMarketIndex(index);
      setMessage('👆 Поставь на подсвеченное место');
      onTutorialAction('pick_tile');
    }
  }, [gameState.turnStep, isGameOver, selectedMarketIndex, onTutorialAction]);

  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    if (gameState.turnStep !== TurnStep.PickTile || isGameOver) return;
    setSelectedMarketIndex(index);
    onTutorialAction('pick_tile');
    e.dataTransfer.effectAllowed = 'move';
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
    setMessage('👆 Перетащи на доску');
  }, [gameState.turnStep, isGameOver, onTutorialAction]);

  const handlePlaceTile = useCallback((pos: GridPos) => {
    if (selectedMarketIndex === null || gameState.turnStep !== TurnStep.PickTile) return;
    const result = placeTile(gameState, selectedMarketIndex, pos);
    setGameState(result.state);
    setSelectedMarketIndex(null);

    if (result.score > 0) {
      setMessage(`+${result.score} 🪙`);
    } else {
      setMessage('😐 0 очков');
    }
    onTutorialAction('place_tile');
  }, [gameState, selectedMarketIndex, onTutorialAction]);

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
      setMessage('🍬 Выбери карточку снизу');
    }
    onTutorialAction('end_turn');
  }, [gameState, onTutorialAction]);

  const handleNewGame = useCallback(() => {
    setGameState(createSinglePlayerGame());
    setSelectedMarketIndex(null);
    setMessage('🍬 Выбери карточку снизу');
  }, []);

  const tutorialTarget = tutorialStep?.target ?? null;
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
            disabled={!canPlace}
            highlightPos={tutorialStep?.boardPos ?? null}
          />
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: 12, display: 'flex', gap: 8, minHeight: 48 }}>
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
          padding: '10px 12px',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Market
          tiles={gameState.market}
          selectedIndex={selectedMarketIndex}
          onSelect={handleSelectMarketTile}
          onDragStart={handleDragStart}
          disabled={gameState.turnStep === TurnStep.ScoreShown || isGameOver}
          highlightIndex={tutorialStep?.marketIndex}
        />
      </div>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '12px 28px',
    fontSize: 18,
    fontWeight: 700,
    backgroundColor: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
  };
}
