import type { PlayerState } from '../types';

interface GameOverProps {
  player: PlayerState;
  turnNumber: number;
  onRestart: () => void;
}

export function GameOver({ player, turnNumber, onRestart }: GameOverProps) {
  const totalScore = player.moneyTokens * 10 + player.coins;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div
        style={{
          background: '#FFF',
          borderRadius: 20,
          padding: '32px 40px',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          maxWidth: 320,
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 800, color: '#5D4E37', marginBottom: 8 }}>
          Магазин готов!
        </div>
        <div style={{ fontSize: 14, color: '#8B7355', marginBottom: 20 }}>
          Ходов: {turnNumber}
        </div>

        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#FF6B00',
            marginBottom: 4,
          }}
        >
          {totalScore}
        </div>
        <div style={{ fontSize: 14, color: '#8B7355', marginBottom: 24 }}>монет</div>

        {player.moneyTokens > 0 && (
          <div style={{ fontSize: 12, color: '#8B7355', marginBottom: 24 }}>
            ({player.moneyTokens} жетонов × 10 + {player.coins})
          </div>
        )}

        <button
          onClick={onRestart}
          style={{
            padding: '12px 32px',
            border: 'none',
            borderRadius: 10,
            background: '#FF6B00',
            color: '#FFF',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255,107,0,0.3)',
          }}
        >
          Играть снова
        </button>
      </div>
    </div>
  );
}
