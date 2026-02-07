import type { Player, Award } from '../game/types';
import { CATEGORY_COLORS, CATEGORY_NAMES_RU, AwardType } from '../game/types';

interface ScorePanelProps {
  player: Player;
  deckRemaining: number;
}

export function ScorePanel({ player, deckRemaining }: ScorePanelProps) {
  const totalScore = player.coins + player.moneyTokens * 10 + player.awards.length * 5;
  const filledSlots = player.board.flat().filter(t => t !== null).length;
  const tilesPlaced = filledSlots - 1; // minus starter

  return (
    <div
      className="score-panel"
      style={{
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minWidth: 200,
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>{player.name}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Монеты:</span>
          <strong>{player.coins + player.moneyTokens * 10}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Награды:</span>
          <strong>{player.awards.length} ({player.awards.length * 5} очков)</strong>
        </div>

        <div
          style={{
            borderTop: '1px solid #eee',
            paddingTop: 8,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          <span>Итого:</span>
          <span style={{ color: '#4CAF50' }}>{totalScore}</span>
        </div>

        {player.awards.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Награды:</div>
            {player.awards.map((award, i) => (
              <AwardBadge key={i} award={award} />
            ))}
          </div>
        )}

        <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
          <div>Тайлов: {tilesPlaced}/15</div>
          <div>В колоде: {deckRemaining}</div>
        </div>
      </div>
    </div>
  );
}

function AwardBadge({ award }: { award: Award }) {
  const color = CATEGORY_COLORS[award.category];
  const catName = CATEGORY_NAMES_RU[award.category];
  const typeName = award.type === AwardType.Diversity ? 'Разнообразие' : 'Большинство';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 12,
        backgroundColor: color,
        color: '#fff',
        fontSize: 11,
        fontWeight: 600,
        marginRight: 4,
        marginBottom: 4,
      }}
    >
      <span>+5</span>
      <span>{catName}</span>
      <span>({typeName})</span>
    </div>
  );
}
