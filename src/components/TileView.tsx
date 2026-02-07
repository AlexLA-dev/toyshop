import type { Tile, TileBlock } from '../game/types';
import { CATEGORY_COLORS, TOY_EMOJI } from '../game/types';

interface TileViewProps {
  tile: Tile;
  size?: number;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  ghost?: boolean;
  scorePreview?: number | null;
}

function blockColor(block: TileBlock): string {
  if (block.category === null) return CATEGORY_COLORS.register;
  return CATEGORY_COLORS[block.category];
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

const GAP = 3;

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
  const half = size / 2;

  const cellOrigin = (idx: number) => ({
    x: (idx % 2) * half,
    y: Math.floor(idx / 2) * half,
  });

  const blockRect = (block: TileBlock) => {
    const origins = block.cells.map(cellOrigin);
    const rawL = Math.min(...origins.map(o => o.x));
    const rawT = Math.min(...origins.map(o => o.y));
    const rawR = Math.max(...origins.map(o => o.x)) + half;
    const rawB = Math.max(...origins.map(o => o.y)) + half;
    const g = GAP / 2;
    const l = rawL === 0 ? 0 : rawL + g;
    const t = rawT === 0 ? 0 : rawT + g;
    const r = rawR === size ? size : rawR - g;
    const b = rawB === size ? size : rawB - g;
    return { x: l, y: t, w: r - l, h: b - t };
  };

  return (
    <div
      className={`tile-view ${className ?? ''} ${ghost ? 'tile-ghost' : ''}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : draggable ? 'grab' : 'default',
        opacity: ghost ? 0.5 : 1,
        boxShadow: ghost ? 'none' : '0 2px 8px rgba(0,0,0,0.18)',
        backgroundColor: '#e8e0d4',
        ...style,
      }}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {tile.blocks.map((block, i) => {
        const rect = blockRect(block);
        const color = blockColor(block);
        const border = darken(color, 30);
        const isQuarter = block.cells.length === 1;
        const isFull = block.cells.length === 4;
        const emoji = TOY_EMOJI[block.toy] ?? block.toy;

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
              border: `2px solid ${border}`,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(0,0,0,0.06) 100%)',
            }}
          >
            <span
              style={{
                fontSize: isQuarter ? Math.max(size * 0.18, 14) : isFull ? Math.max(size * 0.32, 22) : Math.max(size * 0.22, 16),
                lineHeight: 1,
                userSelect: 'none',
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
              }}
            >
              {emoji}
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
            backgroundColor: 'rgba(0,0,0,0.75)',
            color: '#FFD700',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
            fontWeight: 'bold',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          +{scorePreview}
        </div>
      )}
    </div>
  );
}
