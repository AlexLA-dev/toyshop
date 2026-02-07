import type { Player, Award } from '../game/types';
import { CATEGORY_COLORS, CATEGORY_NAMES_RU } from '../game/types';

interface ScoreBarProps {
  player: Player;
  deckRemaining: number;
  message: string;
}

export function ScoreBar({ player, deckRemaining, message }: ScoreBarProps) {
  const totalCoins = player.coins;
  const awardBonus = player.awards.reduce((s, a) => s + a.value, 0);
  const filledSlots = player.board.flat().filter(t => t !== null).length;
  const tilesPlaced = filledSlots - 1;
  const progress = tilesPlaced / 15;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#fff',
        borderBottom: '1px solid #eee',
        padding: '10px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Top row: stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <StatChip icon="💵" value={totalCoins} />
          {awardBonus > 0 && (
            <StatChip icon="🏆" value={`+${awardBonus}`} />
          )}
        </div>

        {/* Deck + progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, color: '#999' }}>
            🃏 {deckRemaining}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, color: '#aaa', fontWeight: 600 }}>{tilesPlaced}/15</span>
            <div style={{
              width: 60,
              height: 6,
              backgroundColor: '#eee',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress * 100}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                borderRadius: 3,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Awards row */}
      {player.awards.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {player.awards.map((award, i) => (
            <AwardBadge key={i} award={award} />
          ))}
        </div>
      )}

      {/* Message */}
      <div style={{
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 700,
        color: '#555',
        marginTop: 6,
        minHeight: 28,
      }}>
        {message}
      </div>
    </div>
  );
}

function StatChip({ icon, value }: { icon: string; value: number | string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 32, fontWeight: 800, color: '#333' }}>{value}</span>
    </div>
  );
}

function AwardBadge({ award }: { award: Award }) {
  const color = CATEGORY_COLORS[award.category];
  const catName = CATEGORY_NAMES_RU[award.category];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 12px',
        borderRadius: 12,
        backgroundColor: color,
        color: '#fff',
        fontSize: 14,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      +5000 {catName}
    </div>
  );
}
