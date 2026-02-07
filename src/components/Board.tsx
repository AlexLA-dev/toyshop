import type { Grid, GamePhase } from '../types';
import { GRID_SIZE, isToyCard, isCash } from '../types';
import { ToyCardView, CashView } from './CardView';

interface BoardProps {
  grid: Grid;
  phase: GamePhase;
  validCells: [number, number][];
  onCellClick: (row: number, col: number) => void;
}

export function Board({ grid, phase, validCells, onCellClick }: BoardProps) {
  const isPlacing = phase === 'place_cash' || phase === 'place_card';
  const cellSize = 72;
  const gap = 4;

  const isValid = (r: number, c: number) =>
    validCells.some(([vr, vc]) => vr === r && vc === c);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
        gap: `${gap}px`,
        padding: 8,
        background: '#F5F0E8',
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}
    >
      {Array.from({ length: GRID_SIZE }).map((_, row) =>
        Array.from({ length: GRID_SIZE }).map((_, col) => {
          const cell = grid[row][col];
          const valid = phase === 'place_cash' ? cell === null : isValid(row, col);
          const canClick = isPlacing && valid;

          return (
            <button
              key={`${row}-${col}`}
              onClick={() => canClick && onCellClick(row, col)}
              style={{
                width: cellSize,
                height: cellSize,
                border: 'none',
                borderRadius: 6,
                padding: 0,
                cursor: canClick ? 'pointer' : 'default',
                background: valid && isPlacing
                  ? 'rgba(255, 107, 0, 0.12)'
                  : cell === null
                    ? '#EDE8DE'
                    : 'transparent',
                outline: valid && isPlacing
                  ? '2px dashed #FF6B00'
                  : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isToyCard(cell) ? (
                <ToyCardView card={cell} size={cellSize - 4} />
              ) : isCash(cell) ? (
                <CashView size={cellSize - 4} />
              ) : valid && isPlacing ? (
                <span style={{ fontSize: 20, opacity: 0.3 }}>+</span>
              ) : null}
            </button>
          );
        }),
      )}
    </div>
  );
}
