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
    <div className="market" style={{ marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#666' }}>
        Витрина ({tiles.length} шт.)
      </h3>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {tiles.map((tile, i) => (
          <div
            key={tile.id}
            style={{
              border: selectedIndex === i ? '3px solid #4CAF50' : '3px solid transparent',
              borderRadius: 9,
              padding: 0,
              transition: 'border-color 0.15s',
            }}
          >
            <TileView
              tile={tile}
              size={90}
              onClick={disabled ? undefined : () => onSelect(i)}
              draggable={!disabled}
              onDragStart={(e) => onDragStart(i, e)}
            />
          </div>
        ))}
        {tiles.length === 0 && (
          <p style={{ color: '#999', fontStyle: 'italic' }}>Карточек больше нет</p>
        )}
      </div>
    </div>
  );
}
