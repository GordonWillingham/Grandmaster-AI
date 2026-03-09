/**
 * Smoke tests for the move generation utility.
 * Run with: npx jest  (or vitest if the repo uses it)
 */
import { getLegalMoves } from './moveGeneration';
import { Board } from '../types/chess';

function emptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array(8).fill('') as string[]) as Board;
}

describe('getLegalMoves', () => {
  test('empty square returns no moves', () => {
    const board = emptyBoard();
    expect(getLegalMoves(board, 3, 3)).toHaveLength(0);
  });

  test('white pawn on starting rank has 2 forward moves', () => {
    const board = emptyBoard();
    board[6][4] = 'wP';
    const moves = getLegalMoves(board, 6, 4);
    expect(moves).toHaveLength(2);
    expect(moves).toContainEqual([5, 4]);
    expect(moves).toContainEqual([4, 4]);
  });

  test('white pawn blocked cannot move forward', () => {
    const board = emptyBoard();
    board[6][4] = 'wP';
    board[5][4] = 'bP'; // blocking piece
    const moves = getLegalMoves(board, 6, 4);
    expect(moves).toHaveLength(0);
  });

  test('white pawn captures diagonally', () => {
    const board = emptyBoard();
    board[6][4] = 'wP';
    board[5][3] = 'bP';
    board[5][5] = 'bP';
    const moves = getLegalMoves(board, 6, 4);
    // forward (one & two) + two captures
    expect(moves).toHaveLength(4);
    expect(moves).toContainEqual([5, 3]);
    expect(moves).toContainEqual([5, 5]);
  });

  test('rook on empty board has 14 moves', () => {
    const board = emptyBoard();
    board[4][4] = 'wR';
    expect(getLegalMoves(board, 4, 4)).toHaveLength(14);
  });

  test('knight on empty board in center has 8 moves', () => {
    const board = emptyBoard();
    board[4][4] = 'wN';
    expect(getLegalMoves(board, 4, 4)).toHaveLength(8);
  });

  test('knight on corner has 2 moves', () => {
    const board = emptyBoard();
    board[0][0] = 'wN';
    expect(getLegalMoves(board, 0, 0)).toHaveLength(2);
  });

  test('bishop on empty board in center has 13 moves', () => {
    const board = emptyBoard();
    board[4][4] = 'wB';
    expect(getLegalMoves(board, 4, 4)).toHaveLength(13);
  });

  test('queen on empty board in center has 27 moves', () => {
    const board = emptyBoard();
    board[4][4] = 'wQ';
    expect(getLegalMoves(board, 4, 4)).toHaveLength(27);
  });

  test('king has max 8 moves on open board', () => {
    const board = emptyBoard();
    board[4][4] = 'wK';
    expect(getLegalMoves(board, 4, 4)).toHaveLength(8);
  });

  test('friendly piece blocks rook ray', () => {
    const board = emptyBoard();
    board[4][4] = 'wR';
    board[4][6] = 'wP'; // blocks rightward ray after col 5
    const moves = getLegalMoves(board, 4, 4);
    // right: cols 5 only (6 is blocked). left: 0-3 (4 squares). up: rows 0-3 (4). down: rows 5-7 (3)
    // right=1, left=4, up=4, down=3 = 12
    expect(moves).toHaveLength(12);
    expect(moves).not.toContainEqual([4, 6]); // can't land on own piece
  });
});
