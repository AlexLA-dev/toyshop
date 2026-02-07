import { useReducer, useCallback } from 'react';
import type { ToyCard } from './types';
import { gameReducer, createInitialState } from './game/state';
import { Board } from './components/Board';
import { Market } from './components/Market';
import { ScoreDisplay } from './components/ScoreDisplay';
import { ComboOverlay } from './components/ComboOverlay';
import { Tutorial } from './components/Tutorial';
import { GameOver } from './components/GameOver';
import { PhaseHint } from './components/PhaseHint';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (state.phase === 'place_cash') {
        dispatch({ type: 'PLACE_CASH', row, col });
      } else if (state.phase === 'place_card') {
        dispatch({ type: 'PLACE_CARD', row, col });
      }
    },
    [state.phase],
  );

  const handleSelectCard = useCallback((card: ToyCard) => {
    dispatch({ type: 'SELECT_CARD', card });
  }, []);

  const handleDismissScore = useCallback(() => {
    dispatch({ type: 'DISMISS_SCORE' });
  }, []);

  const handleAdvanceTutorial = useCallback(() => {
    dispatch({ type: 'ADVANCE_TUTORIAL' });
  }, []);

  const handleRestart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #FFF9F0 0%, #F5EDE0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 8px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: 400,
        margin: '0 auto',
        gap: 10,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 2 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#5D4E37',
            margin: 0,
          }}
        >
          Мой магазин игрушек
        </h1>
      </div>

      {/* Score */}
      <ScoreDisplay
        player={state.player}
        turnNumber={state.turnNumber}
        deckRemaining={state.deck.length}
      />

      {/* Phase hint */}
      <PhaseHint phase={state.phase} />

      {/* Board */}
      <Board
        grid={state.player.grid}
        phase={state.phase}
        validCells={state.validCells}
        onCellClick={handleCellClick}
      />

      {/* Market */}
      <Market
        cards={state.market}
        selectedCard={state.selectedCard}
        enabled={state.phase === 'select_card'}
        onSelectCard={handleSelectCard}
      />

      {/* Combo overlay */}
      {state.phase === 'scoring' && state.lastPlacement && (
        <ComboOverlay result={state.lastPlacement} onDismiss={handleDismissScore} />
      )}

      {/* Game over */}
      {state.phase === 'game_over' && (
        <GameOver
          player={state.player}
          turnNumber={state.turnNumber}
          onRestart={handleRestart}
        />
      )}

      {/* Tutorial */}
      {state.showTutorial && (
        <Tutorial step={state.tutorialStep} onAdvance={handleAdvanceTutorial} />
      )}
    </div>
  );
}
