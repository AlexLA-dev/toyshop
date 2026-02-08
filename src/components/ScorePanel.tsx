import type { Tile, Player, ToyCategory } from '../game/types';
import { CATEGORY_COLORS, ToyCategory as TC, TOYS, TOY_EMOJI } from '../game/types';

interface ScoreBarProps {
  player: Player;
  showQuest?: boolean;
  compact?: boolean;
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

/** Count total cells of a given category on the board */
function countCategoryCells(board: (Tile | null)[][], category: ToyCategory): number {
  let count = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const tile = board[r]?.[c];
      if (!tile) continue;
      for (const block of tile.blocks) {
        if (block.category === category) count += block.cells.length;
      }
    }
  }
  return count;
}

export function ScoreBar({ player, showQuest, compact }: ScoreBarProps) {
  const totalCoins = player.coins;
  const awardBonus = player.awards.reduce((s, a) => s + a.value, 0);
  const filledSlots = player.board.flat().filter(t => t !== null).length;
  const tilesPlaced = filledSlots - 1;
  const progress = tilesPlaced / 15;

  const collected = getCollectedItems(player.board);
  const categories = Object.values(TC) as ToyCategory[];

  const greenCells = countCategoryCells(player.board, TC.Candy);
  const greenTarget = 10;

  // Responsive sizes
  const scoreFs = compact ? 20 : 24;
  const emojiFs = compact ? 15 : 18;
  const smallFs = compact ? 11 : 14;
  const questFs = compact ? 15 : 18;
  const collGap = compact ? 3 : 6;
  const collPad = compact ? '2px 3px' : '3px 5px';
  const emojiGap = compact ? 1 : 2;
  const barPad = compact ? '6px 10px 4px' : '8px 16px 6px';

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#fff',
        borderBottom: '1px solid #eee',
        padding: barPad,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Top row: score + progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: scoreFs - 2 }}>💵</span>
          <span style={{ fontSize: scoreFs, fontWeight: 800, color: '#333' }}>{totalCoins + awardBonus}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: scoreFs, fontWeight: 700, color: '#555' }}>{tilesPlaced}/15</span>
          <div style={{
            width: compact ? 40 : 60,
            height: 8,
            backgroundColor: '#eee',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Collection tracker */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: collGap,
        marginTop: compact ? 4 : 6,
        padding: '2px 0',
      }}>
        {categories.map(cat => {
          const items = TOYS[cat];
          const catCollected = collected[cat];
          const catColor = CATEGORY_COLORS[cat];
          const isComplete = catCollected.size >= 4;
          const completions = isComplete ? 1 : 0;
          return (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? 1 : 2 }}>
              {isComplete && (
                <span style={{ fontSize: smallFs, fontWeight: 700, color: catColor, lineHeight: 1 }}>+5000</span>
              )}
              <div
                style={{
                  display: 'flex',
                  gap: emojiGap,
                  padding: collPad,
                  borderRadius: 8,
                  backgroundColor: isComplete ? catColor : 'transparent',
                  border: `1.5px solid ${isComplete ? catColor : '#e0e0e0'}`,
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
                        fontSize: emojiFs,
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
                fontSize: smallFs,
                fontWeight: 700,
                color: isComplete ? catColor : '#bbb',
                lineHeight: 1,
              }}>
                ×{completions}
              </span>
            </div>
          );
        })}
      </div>

      {/* Green cells quest */}
      {showQuest && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 6,
          padding: '4px 8px',
          backgroundColor: greenCells >= greenTarget ? 'rgba(123, 198, 126, 0.15)' : 'rgba(0,0,0,0.03)',
          borderRadius: 8,
        }}>
          <span style={{ fontSize: questFs }}>🟩</span>
          <span style={{ fontSize: questFs, fontWeight: 600, color: '#555' }}>Зелёных блоков:</span>
          <span style={{
            fontSize: questFs,
            fontWeight: 800,
            color: greenCells >= greenTarget ? '#4CAF50' : '#333',
          }}>
            {greenCells}/{greenTarget}
          </span>
          {greenCells >= greenTarget && (
            <span style={{ fontSize: smallFs, fontWeight: 700, color: '#4CAF50' }}>✓</span>
          )}
          <div style={{
            width: 50,
            height: 6,
            backgroundColor: '#eee',
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${Math.min(greenCells / greenTarget, 1) * 100}%`,
              height: '100%',
              backgroundColor: greenCells >= greenTarget ? '#4CAF50' : '#7BC67E',
              borderRadius: 3,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Export collection helpers for EndGameOverlay */
export { getCollectedItems, countCategoryCells };
