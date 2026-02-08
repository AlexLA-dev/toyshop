import { useState, useCallback } from 'react';
import type { Tile, GridPos } from '../game/types';
import { TileView } from './TileView';
import { getValidPlacements, calculatePlacementScore } from '../game/scoring';

interface GameBoardProps {
  board: (Tile | null)[][];
  selectedTile: Tile | null;
  onPlaceTile: (pos: GridPos) => void;
  disabled?: boolean;
  /** Tutorial: highlight a specific board cell with glow */
  highlightPos?: GridPos | null;
  /** Tutorial: only allow placement at this position (null = allow all valid) */
  allowedPos?: GridPos | null;
  /** Responsive tile size (default 100) */
  tileSize?: number;
  /** Responsive gap (default 4) */
  gap?: number;
  /** Responsive padding (default 12) */
  padding?: number;
}

export function GameBoard({ board, selectedTile, onPlaceTile, disabled, highlightPos, allowedPos, tileSize: tileSizeProp, gap: gapProp, padding: paddingProp }: GameBoardProps) {
  const [dragOverPos, setDragOverPos] = useState<GridPos | null>(null);
  const [hoverPos, setHoverPos] = useState<GridPos | null>(null);

  const validPlacements = selectedTile ? getValidPlacements(board) : [];
  const validSet = new Set(validPlacements.map(p => `${p.row},${p.col}`));

  // When allowedPos is set, only that position is interactive
  const isAllowed = (r: number, c: number) => {
    if (!allowedPos) return true;
    return r === allowedPos.row && c === allowedPos.col;
  };

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
    if (validSet.has(`${pos.row},${pos.col}`) && isAllowed(pos.row, pos.col)) {
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
    if (!disabled && validSet.has(`${pos.row},${pos.col}`) && isAllowed(pos.row, pos.col)) {
      onPlaceTile(pos);
    }
  };

  const handleCellClick = (pos: GridPos) => {
    if (!disabled && selectedTile && validSet.has(`${pos.row},${pos.col}`) && isAllowed(pos.row, pos.col)) {
      onPlaceTile(pos);
    }
  };

  const tileSize = tileSizeProp ?? 100;
  const gap = gapProp ?? 4;
  const padding = paddingProp ?? 12;

  return (
    <div
      className="game-board"
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(4, ${tileSize}px)`,
        gridTemplateRows: `repeat(4, ${tileSize}px)`,
        gap,
        padding,
        backgroundColor: '#f0ebe3',
        borderRadius: 12,
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {board.map((row, r) =>
        row.map((tile, c) => {
          const isValid = validSet.has(`${r},${c}`);
          const cellAllowed = isAllowed(r, c);
          const isDragOver = dragOverPos?.row === r && dragOverPos?.col === c;
          const isHovered = hoverPos?.row === r && hoverPos?.col === c;
          const isTutorialHighlight = highlightPos?.row === r && highlightPos?.col === c;
          const showPreview = isValid && cellAllowed && (isDragOver || isHovered) && selectedTile;
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

          const isInteractive = isValid && cellAllowed;

          return (
            <div
              key={`${r}-${c}`}
              className={`board-cell ${isInteractive ? 'valid-placement' : ''} ${isDragOver ? 'drag-over' : ''} ${isTutorialHighlight ? 'tutorial-glow-item' : ''}`}
              style={{
                width: tileSize,
                height: tileSize,
                borderRadius: 6,
                border: isInteractive
                  ? `2px dashed ${isDragOver ? '#4CAF50' : '#aaa'}`
                  : '2px solid transparent',
                backgroundColor: isInteractive
                  ? isDragOver
                    ? 'rgba(76, 175, 80, 0.15)'
                    : isHovered
                      ? 'rgba(76, 175, 80, 0.1)'
                      : 'rgba(0,0,0,0.03)'
                  : 'rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isInteractive && selectedTile ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onDragOver={(e) => handleDragOver(e, { row: r, col: c })}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, { row: r, col: c })}
              onClick={() => handleCellClick({ row: r, col: c })}
              onMouseEnter={() => isInteractive && setHoverPos({ row: r, col: c })}
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
              {isInteractive && !showPreview && (
                <span style={{ color: '#bbb', fontSize: 24 }}>+</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
