import type { Tile, Player, ToyCategory } from '../game/types';
import { CATEGORY_COLORS, ToyCategory as TC, TOYS, TOY_EMOJI } from '../game/types';

interface ScoreBarProps {
  player: Player;
  deckRemaining: number;
}

/** Compute which items are collected per category from the board */
function getCollectedItems(board: (Tile | null)[][]): Record<ToyCategory, Set<string>> {
  const collected: Record<string, Set<string>> = {};
  for (const cat of Object.values(TC)) {
    collected[cat] = new Set();
  }
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const tile = board[r]?.[c];
      if (!tile) continue;
      for (const block of tile.blocks) {
        if (block.category !== null) {
          collected[block.category].add(block.toy);
        }
      }
    }
  }
  return collected as Record<ToyCategory, Set<string>>;
}

export function ScoreBar({ player, deckRemaining }: ScoreBarProps) {
  const totalCoins = player.coins;
  const awardBonus = player.awards.reduce((s, a) => s + a.value, 0);
  const filledSlots = player.board.flat().filter(t => t !== null).length;
  const tilesPlaced = filledSlots - 1;
  const progress = tilesPlaced / 15;

  const collected = getCollectedItems(player.board);
  const categories = Object.values(TC) as ToyCategory[];

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#fff',
        borderBottom: '1px solid #eee',
        padding: '8px 16px 6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Top row: stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <StatChip icon="💵" value={totalCoins + awardBonus} />
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

      {/* Collection tracker — each group has its own ×N multiplier and bonus */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 6,
        marginTop: 6,
        padding: '2px 0',
      }}>
        {categories.map(cat => {
          const items = TOYS[cat];
          const catCollected = collected[cat];
          const catColor = CATEGORY_COLORS[cat];
          const isComplete = catCollected.size >= 4;
          const count = catCollected.size;
          return (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              {isComplete && (
                <span style={{ fontSize: 10, fontWeight: 700, color: catColor }}>+5000</span>
              )}
              <div
                style={{
                  display: 'flex',
                  gap: 1,
                  padding: '2px 4px',
                  borderRadius: 6,
                  backgroundColor: isComplete ? catColor : 'transparent',
                  border: `1px solid ${isComplete ? catColor : '#e0e0e0'}`,
                  transition: 'all 0.3s ease',
                }}
              >
                {items.map(toy => {
                  const found = catCollected.has(toy);
                  const emoji = TOY_EMOJI[toy] ?? toy;
                  return (
                    <span
                      key={toy}
                      style={{
                        fontSize: 14,
                        filter: found ? 'none' : 'grayscale(1) opacity(0.3)',
                        transition: 'filter 0.3s ease',
                      }}
                    >
                      {emoji}
                    </span>
                  );
                })}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: isComplete ? catColor : '#bbb',
              }}>
                ×{count}
              </span>
            </div>
          );
        })}
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
