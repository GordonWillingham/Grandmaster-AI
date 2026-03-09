// Explicit types for the entire chess domain.
// Centralizing here means every other file imports from one place.

export type Color = 'w' | 'b';
export type PieceType = 'P' | 'R' | 'N' | 'B' | 'Q' | 'K';

/** A non-empty board square, e.g. "wP", "bR" */
export type Piece = `${Color}${PieceType}`;

/** An empty square */
export type EmptySquare = '';

export type Square = Piece | EmptySquare;

/** [row, col] — row 0 is rank 8 (top of visual board) */
export type Coord = [number, number];

export type Board = Square[][];

export function getPieceColor(piece: Square): Color | null {
  if (!piece) return null;
  return piece[0] as Color;
}

export function getPieceType(piece: Square): PieceType | null {
  if (!piece) return null;
  return piece[1] as PieceType;
}

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}
