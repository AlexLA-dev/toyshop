import type { Tile, TileBlock } from '../game/types';
import { CATEGORY_COLORS, TOY_NAMES_RU } from '../game/types';

interface TileViewProps {
  tile: Tile;
  size?: number; // px, default 100
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  ghost?: boolean;  // semi-transparent preview
  scorePreview?: number | null;
}

/** Get color for a block */
function blockColor(block: TileBlock): string {
  if (block.category === null) {
    return CATEGORY_COLORS.register;
  }
  return CATEGORY_COLORS[block.category];
}

/**
 * Render a single tile as a square divided into colored blocks.
 * The tile is a 2×2 grid of cells (each cell is half the tile width/height).
 * Blocks span 1, 2, or 4 cells.
 */
export function TileView({
  tile,
  size = 100,
  onClick,
  draggable,
  onDragStart,
  className,
  style,
  ghost,
  scorePreview,
}: TileViewProps) {
  const cellSize = size / 2;

  /** Get top-left position for a cell index (0=TL, 1=TR, 2=BL, 3=BR) */
  const cellPos = (idx: number) => ({
    x: (idx % 2) * cellSize,
    y: Math.floor(idx / 2) * cellSize,
  });

  /** Compute bounding box for a block's cells */
  const blockRect = (block: TileBlock) => {
    const positions = block.cells.map(cellPos);
    const minX = Math.min(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxX = Math.max(...positions.map(p => p.x)) + cellSize;
    const maxY = Math.max(...positions.map(p => p.y)) + cellSize;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  };

  return (
    <div
      className={`tile-view ${className ?? ''} ${ghost ? 'tile-ghost' : ''}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: 6,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : draggable ? 'grab' : 'default',
        opacity: ghost ? 0.5 : 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        ...style,
      }}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {tile.blocks.map((block, i) => {
        const rect = blockRect(block);
        const color = blockColor(block);
        const isRegister = block.category === null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: rect.x,
              top: rect.y,
              width: rect.w,
              height: rect.h,
              backgroundColor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: rect.x + rect.w < size ? '1px solid rgba(255,255,255,0.3)' : undefined,
              borderBottom: rect.y + rect.h < size ? '1px solid rgba(255,255,255,0.3)' : undefined,
            }}
          >
            <span
              style={{
                fontSize: rect.w < cellSize * 1.5 ? 10 : 12,
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                fontWeight: 600,
                textAlign: 'center',
                lineHeight: 1.2,
                padding: 2,
                wordBreak: 'break-word',
              }}
            >
              {isRegister ? '🏪' : TOY_NAMES_RU[block.toy] ?? block.toy}
            </span>
          </div>
        );
      })}
      {scorePreview != null && scorePreview > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#FFD700',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 'bold',
            zIndex: 10,
          }}
        >
          +{scorePreview}
        </div>
      )}
    </div>
  );
}
