import type { PlayerState } from '../types';

interface ScoreDisplayProps {
  player: PlayerState;
  turnNumber: number;
  deckRemaining: number;
}

export function ScoreDisplay({ player, turnNumber, deckRemaining }: ScoreDisplayProps) {
  const totalScore = player.moneyTokens * 10 + player.coins;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        background: '#FFF9F0',
        borderRadius: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#8B7355', fontWeight: 600 }}>Ход</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#5D4E37' }}>{turnNumber}</div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#8B7355', fontWeight: 600 }}>Счёт</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#FF6B00' }}>{totalScore}</div>
        {player.moneyTokens > 0 && (
          <div style={{ fontSize: 10, color: '#8B7355' }}>
            {player.moneyTokens}x10 + {player.coins}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#8B7355', fontWeight: 600 }}>Колода</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#5D4E37' }}>{deckRemaining}</div>
      </div>
    </div>
  );
}
