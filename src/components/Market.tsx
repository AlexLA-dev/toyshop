import { useRef, useEffect } from 'react';
import type { Tile } from '../game/types';
import { TileView } from './TileView';

const MARKET_ANIM_CSS = `
@keyframes market-slide-in {
  0% { transform: translateX(100px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
`;

let marketCssInjected = false;
function injectMarketCSS() {
  if (marketCssInjected) return;
  marketCssInjected = true;
  const style = document.createElement('style');
  style.textContent = MARKET_ANIM_CSS;
  document.head.appendChild(style);
}

interface MarketProps {
  tiles: Tile[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onDragStart: (index: number, e: React.DragEvent) => void;
  onDragEnd?: () => void;
  disabled?: boolean;
  /** Tutorial: highlight a specific tile with glow */
  highlightIndex?: number;
  /** Tutorial: only this index is interactive (others are dimmed) */
  lockedIndex?: number;
  /** Responsive tile size (default 84) */
  tileSize?: number;
}

export function Market({ tiles, selectedIndex, onSelect, onDragStart, onDragEnd, disabled, highlightIndex, lockedIndex, tileSize = 84 }: MarketProps) {
  injectMarketCSS();

  // Track previous tile IDs to detect newly added tiles for slide animation
  const prevIdsRef = useRef<string[] | null>(null);
  if (prevIdsRef.current === null) {
    prevIdsRef.current = tiles.map(t => t.id);
  }
  const prevIdSet = new Set(prevIdsRef.current);
  const newTileIds = new Set(tiles.filter(t => !prevIdSet.has(t.id)).map(t => t.id));

  useEffect(() => {
    prevIdsRef.current = tiles.map(t => t.id);
  });

  return (
    <div style={{ display: 'flex', gap: tileSize < 80 ? 6 : 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      {tiles.map((tile, i) => {
        const isSelected = selectedIndex === i;
        const isHighlighted = highlightIndex === i;
        const isLocked = lockedIndex !== undefined && i !== lockedIndex;
        const tileDisabled = disabled || isLocked;
        const isNew = newTileIds.has(tile.id);
        return (
          <div
            key={tile.id}
            className={isHighlighted ? 'tutorial-glow-item' : ''}
            onDragEnd={() => onDragEnd?.()}
            style={{
              border: isSelected ? '3px solid #4CAF50' : '3px solid transparent',
              borderRadius: 11,
              transition: 'border-color 0.15s, transform 0.15s, opacity 0.15s',
              transform: isSelected ? 'scale(1.08)' : 'scale(1)',
              opacity: isLocked ? 0.35 : 1,
              animation: isNew ? 'market-slide-in 0.35s ease-out' : 'none',
            }}
          >
            <TileView
              tile={tile}
              size={tileSize}
              onClick={tileDisabled ? undefined : () => onSelect(i)}
              draggable={!tileDisabled}
              onDragStart={(e) => onDragStart(i, e)}
            />
          </div>
        );
      })}
      {tiles.length === 0 && (
        <span style={{ color: '#999', fontStyle: 'italic', fontSize: 14 }}>Пусто</span>
      )}
    </div>
  );
}
