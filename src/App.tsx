import React, { useState, useCallback } from 'react';
import './App.css';
import { Board, Color, Coord, Square, getPieceColor } from './types/chess';
import { getLegalMoves, isLegalMove } from './utils/moveGeneration';

// ---------------------------------------------------------------------------
// Initial board layout — rank 8 at index 0, rank 1 at index 7
// ---------------------------------------------------------------------------
const initialBoard: Board = [
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
];

// ---------------------------------------------------------------------------
// Piece rendering — using Unicode chess symbols
// (Replace with your own image/component if the repo already has one.)
// ---------------------------------------------------------------------------
const PIECE_SYMBOLS: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

// ---------------------------------------------------------------------------
// App component
// ---------------------------------------------------------------------------
export default function App() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [currentTurn, setCurrentTurn] = useState<Color>('w');
  const [selectedCoord, setSelectedCoord] = useState<Coord | null>(null);
  const [legalMoves, setLegalMoves] = useState<Coord[]>([]);

  // -------------------------------------------------------------------------
  // Core click handler
  // -------------------------------------------------------------------------
  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      const clickedSquare: Square = board[row][col];
      const clickedColor = getPieceColor(clickedSquare);

      // ------------------------------------------------------------------
      // Case 1: A piece is already selected
      // ------------------------------------------------------------------
      if (selectedCoord !== null) {
        const [selRow, selCol] = selectedCoord;

        // 1a: Clicking the already-selected piece → deselect
        if (selRow === row && selCol === col) {
          setSelectedCoord(null);
          setLegalMoves([]);
          return;
        }

        // 1b: Clicking another friendly piece → switch selection
        if (clickedColor === currentTurn) {
          const newMoves = getLegalMoves(board, row, col);
          setSelectedCoord([row, col]);
          setLegalMoves(newMoves);
          return;
        }

        // 1c: Clicking a highlighted (legal) destination → execute move
        if (isLegalMove(legalMoves, row, col)) {
          const newBoard = board.map(r => [...r]) as Board;
          newBoard[row][col] = newBoard[selRow][selCol];
          newBoard[selRow][selCol] = '';

          setBoard(newBoard);
          setCurrentTurn(currentTurn === 'w' ? 'b' : 'w');
          setSelectedCoord(null);
          setLegalMoves([]);
          return;
        }

        // 1d: Clicking a non-legal, non-friendly square → clear selection
        setSelectedCoord(null);
        setLegalMoves([]);
        return;
      }

      // ------------------------------------------------------------------
      // Case 2: Nothing selected yet
      // ------------------------------------------------------------------

      // 2a: Clicking an empty square → nothing to do
      if (!clickedSquare) return;

      // 2b: Clicking the wrong player's piece → ignore
      if (clickedColor !== currentTurn) return;

      // 2c: Select this piece and compute its legal moves
      const newMoves = getLegalMoves(board, row, col);
      setSelectedCoord([row, col]);
      setLegalMoves(newMoves);
    },
    [board, currentTurn, selectedCoord, legalMoves],
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="app">
      <h1>Grandmaster AI</h1>
      <p className="turn-indicator">
        {currentTurn === 'w' ? '⬜ White' : '⬛ Black'}'s turn
      </p>

      <div className="board">
        {board.map((row, rowIdx) =>
          row.map((square, colIdx) => {
            const isLight = (rowIdx + colIdx) % 2 === 0;
            const isSelected =
              selectedCoord !== null &&
              selectedCoord[0] === rowIdx &&
              selectedCoord[1] === colIdx;
            const isHighlighted = isLegalMove(legalMoves, rowIdx, colIdx);
            const isCapture = isHighlighted && square !== '';

            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={[
                  'square',
                  isLight ? 'square--light' : 'square--dark',
                  isSelected ? 'square--selected' : '',
                  isHighlighted ? 'square--highlight' : '',
                  isCapture ? 'square--capture' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSquareClick(rowIdx, colIdx)}
                role="button"
                aria-label={`Square ${String.fromCharCode(97 + colIdx)}${8 - rowIdx}${square ? ` - ${square}` : ''}`}
              >
                {/* Legal move dot (empty squares only) */}
                {isHighlighted && !isCapture && (
                  <div className="move-dot" aria-hidden="true" />
                )}

                {/* The piece */}
                {square && (
                  <span className="piece" aria-hidden="true">
                    {PIECE_SYMBOLS[square] ?? square}
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
