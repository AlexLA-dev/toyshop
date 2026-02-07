import type { Tile } from '../game/types';
import { TileView } from './TileView';

interface MarketProps {
  tiles: Tile[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onDragStart: (index: number, e: React.DragEvent) => void;
  disabled?: boolean;
}

export function Market({ tiles, selectedIndex, onSelect, onDragStart, disabled }: MarketProps) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
      {tiles.map((tile, i) => (
        <div
          key={tile.id}
          style={{
            border: selectedIndex === i ? '3px solid #4CAF50' : '3px solid transparent',
            borderRadius: 11,
            transition: 'border-color 0.15s, transform 0.15s',
            transform: selectedIndex === i ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <TileView
            tile={tile}
            size={80}
            onClick={disabled ? undefined : () => onSelect(i)}
            draggable={!disabled}
            onDragStart={(e) => onDragStart(i, e)}
          />
        </div>
      ))}
      {tiles.length === 0 && (
        <span style={{ color: '#999', fontStyle: 'italic', fontSize: 13 }}>Пусто</span>
      )}
    </div>
  );
}
