/**
 * Move generation utility.
 *
 * Design decisions:
 * - Pure functions only — no side effects, easy to unit test.
 * - Returns Coord[] (not a Set) so callers can map/filter without conversion.
 * - Each piece type has its own named function for readability and future extension.
 * - Sliding pieces (R, B, Q) share a generic `slide` helper to avoid repetition.
 * - v1 scope: normal moves only. No castling, en passant, or check filtering.
 */

import {
  Board,
  Color,
  Coord,
  getPieceColor,
  getPieceType,
  isInBounds,
} from '../types/chess';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Walk in one direction until the board edge or a blocking piece.
 * Captures the first enemy piece encountered; stops before a friendly piece.
 */
function slide(
  board: Board,
  fromRow: number,
  fromCol: number,
  color: Color,
  directions: Coord[],
): Coord[] {
  const moves: Coord[] = [];

  for (const [dr, dc] of directions) {
    let r = fromRow + dr;
    let c = fromCol + dc;

    while (isInBounds(r, c)) {
      const target = board[r][c];
      const targetColor = getPieceColor(target);

      if (targetColor === color) {
        // Blocked by own piece — stop this ray
        break;
      }

      moves.push([r, c]);

      if (targetColor !== null) {
        // Captured an enemy piece — stop this ray
        break;
      }

      r += dr;
      c += dc;
    }
  }

  return moves;
}

// ---------------------------------------------------------------------------
// Per-piece move generators
// ---------------------------------------------------------------------------

function getPawnMoves(
  board: Board,
  row: number,
  col: number,
  color: Color,
): Coord[] {
  const moves: Coord[] = [];
  // White moves up the visual board (decreasing row index).
  // Black moves down (increasing row index).
  const direction = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;

  // One square forward
  const oneForward = row + direction;
  if (isInBounds(oneForward, col) && board[oneForward][col] === '') {
    moves.push([oneForward, col]);

    // Two squares forward from starting rank
    const twoForward = row + 2 * direction;
    if (row === startRow && isInBounds(twoForward, col) && board[twoForward][col] === '') {
      moves.push([twoForward, col]);
    }
  }

  // Diagonal captures
  for (const dc of [-1, 1]) {
    const captureCol = col + dc;
    if (isInBounds(oneForward, captureCol)) {
      const target = board[oneForward][captureCol];
      if (getPieceColor(target) !== null && getPieceColor(target) !== color) {
        moves.push([oneForward, captureCol]);
      }
    }
  }

  return moves;
}

function getRookMoves(
  board: Board,
  row: number,
  col: number,
  color: Color,
): Coord[] {
  return slide(board, row, col, color, [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1],  // right
  ]);
}

function getKnightMoves(
  board: Board,
  row: number,
  col: number,
  color: Color,
): Coord[] {
  const offsets: Coord[] = [
    [-2, -1], [-2, 1],
    [-1, -2], [-1, 2],
    [1, -2],  [1, 2],
    [2, -1],  [2, 1],
  ];

  return offsets
    .map(([dr, dc]): Coord => [row + dr, col + dc])
    .filter(([r, c]) => isInBounds(r, c) && getPieceColor(board[r][c]) !== color);
}

function getBishopMoves(
  board: Board,
  row: number,
  col: number,
  color: Color,
): Coord[] {
  return slide(board, row, col, color, [
    [-1, -1], // up-left
    [-1, 1],  // up-right
    [1, -1],  // down-left
    [1, 1],   // down-right
  ]);
}

function getQueenMoves(
  board: Board,
  row: number,
  col: number,
  color: Color,
): Coord[] {
  // Queen = rook + bishop
  return [
    ...getRookMoves(board, row, col, color),
    ...getBishopMoves(board, row, col, color),
  ];
}

function getKingMoves(
  board: Board,
  row: number,
  col: number,
  color: Color,
): Coord[] {
  const offsets: Coord[] = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],            [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];

  return offsets
    .map(([dr, dc]): Coord => [row + dr, col + dc])
    .filter(([r, c]) => isInBounds(r, c) && getPieceColor(board[r][c]) !== color);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns every legal destination for the piece at [row, col].
 * Returns an empty array if the square is empty.
 *
 * v1: does NOT filter out moves that leave the king in check.
 */
export function getLegalMoves(
  board: Board,
  row: number,
  col: number,
): Coord[] {
  const piece = board[row][col];
  const color = getPieceColor(piece);
  const type = getPieceType(piece);

  if (!color || !type) return [];

  switch (type) {
    case 'P': return getPawnMoves(board, row, col, color);
    case 'R': return getRookMoves(board, row, col, color);
    case 'N': return getKnightMoves(board, row, col, color);
    case 'B': return getBishopMoves(board, row, col, color);
    case 'Q': return getQueenMoves(board, row, col, color);
    case 'K': return getKingMoves(board, row, col, color);
    default:  return [];
  }
}

/**
 * Convenience: check whether [row, col] appears in a list of coords.
 * Used by the board renderer to decide whether to highlight a square.
 */
export function isLegalMove(moves: Coord[], row: number, col: number): boolean {
  return moves.some(([r, c]) => r === row && c === col);
}
