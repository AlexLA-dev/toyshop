import { useState, useCallback } from 'react';
import type { Tile, GridPos } from '../game/types';
import { TileView } from './TileView';
import { getValidPlacements, calculatePlacementScore } from '../game/scoring';

interface GameBoardProps {
  board: (Tile | null)[][];
  selectedTile: Tile | null;
  onPlaceTile: (pos: GridPos) => void;
  disabled?: boolean;
}

export function GameBoard({ board, selectedTile, onPlaceTile, disabled }: GameBoardProps) {
  const [dragOverPos, setDragOverPos] = useState<GridPos | null>(null);
  const [hoverPos, setHoverPos] = useState<GridPos | null>(null);

  const validPlacements = selectedTile ? getValidPlacements(board) : [];
  const validSet = new Set(validPlacements.map(p => `${p.row},${p.col}`));

  const getScorePreview = useCallback(
    (pos: GridPos): number | null => {
      if (!selectedTile) return null;
      if (!validSet.has(`${pos.row},${pos.col}`)) return null;
      const result = calculatePlacementScore(board, selectedTile, pos);
      return result.total;
    },
    [board, selectedTile, validSet]
  );

  const handleDragOver = (e: React.DragEvent, pos: GridPos) => {
    e.preventDefault();
    if (validSet.has(`${pos.row},${pos.col}`)) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverPos(pos);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = () => {
    setDragOverPos(null);
  };

  const handleDrop = (e: React.DragEvent, pos: GridPos) => {
    e.preventDefault();
    setDragOverPos(null);
    if (!disabled && validSet.has(`${pos.row},${pos.col}`)) {
      onPlaceTile(pos);
    }
  };

  const handleCellClick = (pos: GridPos) => {
    if (!disabled && selectedTile && validSet.has(`${pos.row},${pos.col}`)) {
      onPlaceTile(pos);
    }
  };

  const tileSize = 100;
  const gap = 4;

  return (
    <div
      className="game-board"
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(4, ${tileSize}px)`,
        gridTemplateRows: `repeat(4, ${tileSize}px)`,
        gap,
        padding: 12,
        backgroundColor: '#f0ebe3',
        borderRadius: 12,
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {board.map((row, r) =>
        row.map((tile, c) => {
          const isValid = validSet.has(`${r},${c}`);
          const isDragOver = dragOverPos?.row === r && dragOverPos?.col === c;
          const isHovered = hoverPos?.row === r && hoverPos?.col === c;
          const showPreview = isValid && (isDragOver || isHovered) && selectedTile;
          const scorePreview = showPreview ? getScorePreview({ row: r, col: c }) : null;

          if (tile) {
            return (
              <TileView
                key={`${r}-${c}`}
                tile={tile}
                size={tileSize}
              />
            );
          }

          return (
            <div
              key={`${r}-${c}`}
              className={`board-cell ${isValid ? 'valid-placement' : ''} ${isDragOver ? 'drag-over' : ''}`}
              style={{
                width: tileSize,
                height: tileSize,
                borderRadius: 6,
                border: isValid
                  ? `2px dashed ${isDragOver ? '#4CAF50' : '#aaa'}`
                  : '2px solid transparent',
                backgroundColor: isValid
                  ? isDragOver
                    ? 'rgba(76, 175, 80, 0.15)'
                    : isHovered
                      ? 'rgba(76, 175, 80, 0.1)'
                      : 'rgba(0,0,0,0.03)'
                  : 'rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isValid && selectedTile ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onDragOver={(e) => handleDragOver(e, { row: r, col: c })}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, { row: r, col: c })}
              onClick={() => handleCellClick({ row: r, col: c })}
              onMouseEnter={() => isValid && setHoverPos({ row: r, col: c })}
              onMouseLeave={() => setHoverPos(null)}
            >
              {showPreview && selectedTile && (
                <TileView
                  tile={selectedTile}
                  size={tileSize - 4}
                  ghost
                  scorePreview={scorePreview}
                />
              )}
              {isValid && !showPreview && (
                <span style={{ color: '#bbb', fontSize: 24 }}>+</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
