import type { Tile } from '../game/types';
import { TileView } from './TileView';

interface MarketProps {
  tiles: Tile[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onDragStart: (index: number, e: React.DragEvent) => void;
  disabled?: boolean;
  /** Tutorial: highlight a specific tile with glow */
  highlightIndex?: number;
}

export function Market({ tiles, selectedIndex, onSelect, onDragStart, disabled, highlightIndex }: MarketProps) {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
      {tiles.map((tile, i) => {
        const isSelected = selectedIndex === i;
        const isHighlighted = highlightIndex === i;
        return (
          <div
            key={tile.id}
            className={isHighlighted ? 'tutorial-glow-item' : ''}
            style={{
              border: isSelected ? '3px solid #4CAF50' : '3px solid transparent',
              borderRadius: 11,
              transition: 'border-color 0.15s, transform 0.15s',
              transform: isSelected ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            <TileView
              tile={tile}
              size={84}
              onClick={disabled ? undefined : () => onSelect(i)}
              draggable={!disabled}
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
