import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, GridPos } from '../game/types';
import { TurnStep, GamePhase } from '../game/types';
import type { TutorialAction, TutorialStep } from './Tutorial';
import { GameBoard } from './GameBoard';
import { Market } from './Market';
import { ScoreBar } from './ScorePanel';
import { createSinglePlayerGame, placeTile, endTurn } from '../game/state';
import { calculateFinalScore, determineMajorityAwards } from '../game/scoring';

interface GameScreenProps {
  tutorialStep: TutorialStep | null;
  onTutorialAction: (action: TutorialAction) => void;
  initialState?: GameState;
}

export function GameScreen({ tutorialStep, onTutorialAction, initialState }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(
    () => initialState ?? createSinglePlayerGame()
  );
  const [selectedMarketIndex, setSelectedMarketIndex] = useState<number | null>(null);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const animFrameRef = useRef(0);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isGameOver = gameState.phase === GamePhase.Ended;
  const inTutorial = tutorialStep !== null;

  const selectedTile = selectedMarketIndex !== null ? gameState.market[selectedMarketIndex] ?? null : null;
  const canPlace = selectedMarketIndex !== null && gameState.turnStep === TurnStep.PickTile && !isGameOver;

  // Auto-endTurn always when ScoreShown (no "Далее" button anywhere)
  useEffect(() => {
    if (gameState.turnStep === TurnStep.ScoreShown && !isGameOver) {
      const timer = setTimeout(() => {
        const newState = endTurn(gameState);
        if (newState.phase === GamePhase.Ended) {
          const majorityAwards = determineMajorityAwards(newState.players);
          const updatedPlayers = newState.players.map(p => ({
            ...p,
            awards: [...p.awards, ...(majorityAwards.get(p.id) ?? [])],
          }));
          const finalState = { ...newState, players: updatedPlayers };
          setGameState(finalState);
          const finalScore = calculateFinalScore(updatedPlayers[0]);
          setAnimatedScore(0);
          setShowEndOverlay(true);
          animateScoreCounter(finalScore);
        } else {
          setGameState(newState);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [gameState, isGameOver]);

  const handleSelectMarketTile = useCallback((index: number) => {
    if (gameState.turnStep !== TurnStep.PickTile || isGameOver) return;

    // Tutorial: block non-allowed selections
    if (inTutorial && tutorialStep) {
      if (tutorialStep.action !== 'pick_tile') return;
      if (!tutorialStep.freePlay && tutorialStep.marketIndex !== undefined && index !== tutorialStep.marketIndex) return;
    }

    if (selectedMarketIndex === index) {
      setSelectedMarketIndex(null);
    } else {
      setSelectedMarketIndex(index);
      onTutorialAction('pick_tile');
    }
  }, [gameState.turnStep, isGameOver, selectedMarketIndex, onTutorialAction, inTutorial, tutorialStep]);

  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    if (gameState.turnStep !== TurnStep.PickTile || isGameOver) return;

    // Tutorial: block non-allowed drags
    if (inTutorial && tutorialStep) {
      if (tutorialStep.action !== 'pick_tile') return;
      if (!tutorialStep.freePlay && tutorialStep.marketIndex !== undefined && index !== tutorialStep.marketIndex) return;
    }

    setSelectedMarketIndex(index);
    onTutorialAction('pick_tile');
    e.dataTransfer.effectAllowed = 'move';
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
  }, [gameState.turnStep, isGameOver, onTutorialAction, inTutorial, tutorialStep]);

  const handlePlaceTile = useCallback((pos: GridPos) => {
    if (selectedMarketIndex === null || gameState.turnStep !== TurnStep.PickTile) return;

    // Tutorial: block non-allowed placements
    if (inTutorial && tutorialStep) {
      if (tutorialStep.action !== 'place_tile') return;
      if (!tutorialStep.freePlay && tutorialStep.boardPos) {
        if (pos.row !== tutorialStep.boardPos.row || pos.col !== tutorialStep.boardPos.col) return;
      }
    }

    const result = placeTile(gameState, selectedMarketIndex, pos);
    setGameState(result.state);
    setSelectedMarketIndex(null);
    onTutorialAction('place_tile');
  }, [gameState, selectedMarketIndex, onTutorialAction, inTutorial, tutorialStep]);

  const animateScoreCounter = (target: number) => {
    cancelAnimationFrame(animFrameRef.current);
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setAnimatedScore(Math.round(eased * target));
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  };

  const handleNewGame = useCallback(() => {
    setGameState(createSinglePlayerGame());
    setSelectedMarketIndex(null);
    setShowEndOverlay(false);
    setAnimatedScore(0);
  }, []);

  const tutorialTarget = tutorialStep?.target ?? null;
  const highlightMarket = tutorialTarget === 'market';
  const highlightBoard = tutorialTarget === 'board';
  const highlightScorebar = tutorialTarget === 'scorebar';

  // Compute allowed board position for tutorial
  const tutorialAllowedPos = (inTutorial && tutorialStep?.boardPos && !tutorialStep.freePlay)
    ? tutorialStep.boardPos
    : null;

  // Compute tutorial lock for market (only allow specific index)
  const tutorialMarketLock = (inTutorial && tutorialStep?.marketIndex !== undefined && !tutorialStep?.freePlay)
    ? tutorialStep.marketIndex
    : undefined;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Top score bar */}
      <div className={highlightScorebar ? 'tutorial-highlight' : ''}>
        <ScoreBar player={currentPlayer} deckRemaining={gameState.deck.length} />
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
            allowedPos={tutorialAllowedPos}
          />
        </div>

        {/* New game button only when game over without overlay */}
        {isGameOver && !showEndOverlay && (
          <div style={{ marginTop: 12 }}>
            <button onClick={handleNewGame} style={btnStyle('#2196F3')}>
              Новая игра
            </button>
          </div>
        )}
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
          lockedIndex={tutorialMarketLock}
        />
      </div>

      {/* End-game overlay with confetti + score counter */}
      {showEndOverlay && <EndGameOverlay score={animatedScore} onNewGame={handleNewGame} />}
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

/* ---- End-game overlay with confetti ---- */

const CONFETTI_CSS = `
@keyframes confetti-fall {
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
@keyframes score-pop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
`;

let confettiCssInjected = false;
function injectConfettiCSS() {
  if (confettiCssInjected) return;
  confettiCssInjected = true;
  const style = document.createElement('style');
  style.textContent = CONFETTI_CSS;
  document.head.appendChild(style);
}

const CONFETTI_COLORS = ['#E85D5D', '#5BC0EB', '#C882D6', '#7BC67E', '#F5A623', '#FFD700'];

function EndGameOverlay({ score, onNewGame }: { score: number; onNewGame: () => void }) {
  injectConfettiCSS();

  const confettiPieces = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 8,
    }))
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {confettiPieces.current.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : 2,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            opacity: 0,
            zIndex: 2001,
          }}
        />
      ))}

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 24,
          padding: '32px 48px',
          textAlign: 'center',
          boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
          zIndex: 2002,
          animation: 'score-pop 0.6s ease-out forwards',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <div style={{ fontSize: 20, color: '#888', fontWeight: 600, marginBottom: 8 }}>Итого</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#333', marginBottom: 4 }}>
          {score}
        </div>
        <div style={{ fontSize: 28, marginBottom: 20 }}>💵</div>
        <button
          onClick={onNewGame}
          style={{
            padding: '14px 36px',
            fontSize: 20,
            fontWeight: 700,
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
          }}
        >
          Новая игра
        </button>
      </div>
    </div>
  );
}
