import type { ToyCard, CashRegister, ToyColor } from '../types';

const COLOR_MAP: Record<ToyColor, string> = {
  red: '#E74C3C',
  blue: '#3498DB',
  green: '#2ECC71',
  yellow: '#F1C40F',
};

const COLOR_LABEL: Record<ToyColor, string> = {
  red: 'К',
  blue: 'С',
  green: 'З',
  yellow: 'Ж',
};

interface ToyCardViewProps {
  card: ToyCard;
  size: number;
  dimmed?: boolean;
}

export function ToyCardView({ card, size, dimmed }: ToyCardViewProps) {
  const s = size;
  const edge = s * 0.18;
  const center = s * 0.4;
  const offset = (s - center) / 2;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{ opacity: dimmed ? 0.4 : 1 }}
    >
      {/* Background */}
      <rect x={0} y={0} width={s} height={s} rx={4} fill="#FFF9F0" stroke="#D5C4A1" strokeWidth={1} />

      {/* North edge */}
      <rect x={edge} y={0} width={s - edge * 2} height={edge} rx={2} fill={COLOR_MAP[card.edges.N]} opacity={0.85} />
      {/* South edge */}
      <rect x={edge} y={s - edge} width={s - edge * 2} height={edge} rx={2} fill={COLOR_MAP[card.edges.S]} opacity={0.85} />
      {/* West edge */}
      <rect x={0} y={edge} width={edge} height={s - edge * 2} rx={2} fill={COLOR_MAP[card.edges.W]} opacity={0.85} />
      {/* East edge */}
      <rect x={s - edge} y={edge} width={edge} height={s - edge * 2} rx={2} fill={COLOR_MAP[card.edges.E]} opacity={0.85} />

      {/* Center: toy counts */}
      {Object.entries(card.toys).map(([color, count], i) => {
        if (!count) return null;
        const c = color as ToyColor;
        const cols = Object.keys(card.toys).filter((k) => (card.toys[k as ToyColor] ?? 0) > 0).length;
        const row = Math.floor(i / 2);
        const col = i % 2;
        const cellW = center / Math.min(cols, 2);
        const cellH = center / Math.ceil(cols / 2);
        const cx = offset + col * cellW + cellW / 2;
        const cy = offset + row * cellH + cellH / 2;

        return (
          <g key={color}>
            <circle cx={cx} cy={cy} r={Math.min(cellW, cellH) * 0.35} fill={COLOR_MAP[c]} opacity={0.25} />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={Math.min(cellW, cellH) * 0.4}
              fontWeight="bold"
              fill={COLOR_MAP[c]}
            >
              {COLOR_LABEL[c]}{count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface CashViewProps {
  size: number;
}

export function CashView({ size }: CashViewProps) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <rect x={0} y={0} width={s} height={s} rx={4} fill="#FFF3E0" stroke="#FF9800" strokeWidth={2} />
      <text
        x={s / 2}
        y={s / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={s * 0.35}
      >
        💰
      </text>
    </svg>
  );
}

interface MarketCardProps {
  card: ToyCard;
  selected: boolean;
  onSelect: () => void;
}

export function MarketCard({ card, selected, onSelect }: MarketCardProps) {
  return (
    <button
      onClick={onSelect}
      style={{
        padding: 3,
        border: selected ? '3px solid #FF6B00' : '3px solid transparent',
        borderRadius: 8,
        background: selected ? '#FFF3E0' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <ToyCardView card={card} size={68} />
    </button>
  );
}

export { COLOR_MAP, COLOR_LABEL };
export type { CashRegister };
