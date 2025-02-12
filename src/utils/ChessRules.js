
export const isValidMove = (piece, move, board, enPassant) => {
  const { from, to } = move;
  const dr = to.row - from.row;
  const dc = to.col - from.col;

  // Ensure destination is within bounds.
  if (to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7) return false;

  // Cannot capture your own piece.
  if (board[to.row][to.col] && board[to.row][to.col].color === piece.color) return false;

  switch (piece.type) {
    case 'pawn':
      return validatePawn(piece, move, board, enPassant);
    case 'rook':
      return validateRook(piece, move, board);
    case 'knight':
      return validateKnight(dr, dc);
    case 'bishop':
      return validateBishop(piece, move, board);
    case 'queen':
      return validateRook(piece, move, board) || validateBishop(piece, move, board);
    case 'king':
      return validateKing(piece, move, board);
    default:
      return false;
  }
};

const validatePawn = (piece, move, board, enPassant) => {
  const { from, to } = move;
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;

  // Forward move.
  if (dc === 0) {
    // One square forward.
    if (dr === direction && !board[to.row][to.col]) {
      return true;
    }
    // Two squares forward from starting row.
    if (
      dr === 2 * direction &&
      from.row === startRow &&
      !board[from.row + direction][from.col] &&
      !board[to.row][to.col]
    ) {
      return true;
    }
  }
  // Diagonal capture or en passant.
  if (Math.abs(dc) === 1 && dr === direction) {
    if (board[to.row][to.col] && board[to.row][to.col].color !== piece.color) {
      return true;
    }
    if (enPassant && enPassant.row === to.row && enPassant.col === to.col) {
      return true;
    }
  }
  return false;
};

const validateRook = (piece, move, board) => {
  const { from, to } = move;
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  if (dr !== 0 && dc !== 0) return false;
  const stepRow = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepCol = dc === 0 ? 0 : dc / Math.abs(dc);
  let r = from.row + stepRow;
  let c = from.col + stepCol;
  while (r !== to.row || c !== to.col) {
    if (board[r][c]) return false;
    r += stepRow;
    c += stepCol;
  }
  return true;
};

const validateKnight = (dr, dc) => {
  return (Math.abs(dr) === 2 && Math.abs(dc) === 1) ||
         (Math.abs(dr) === 1 && Math.abs(dc) === 2);
};

const validateBishop = (piece, move, board) => {
  const { from, to } = move;
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  if (Math.abs(dr) !== Math.abs(dc)) return false;
  const stepRow = dr / Math.abs(dr);
  const stepCol = dc / Math.abs(dc);
  let r = from.row + stepRow;
  let c = from.col + stepCol;
  while (r !== to.row && c !== to.col) {
    if (board[r][c]) return false;
    r += stepRow;
    c += stepCol;
  }
  return true;
};

const validateKing = (piece, move, board) => {
  const { from, to } = move;
  const dr = Math.abs(to.row - from.row);
  const dc = Math.abs(to.col - from.col);
  // Normal one-square move.
  if (dr <= 1 && dc <= 1) {
    return !wouldKingBeInCheck(piece, move, board);
  }
  // Castling: king moves two squares horizontally.
  if (dr === 0 && dc === 2 && !piece.hasMoved) {
    // Kingside castling.
    if (to.col === 6) {
      const rook = board[from.row][7];
      if (!rook || rook.type !== 'rook' || rook.hasMoved) return false;
      if (board[from.row][5] || board[from.row][6]) return false;
      if (wouldKingBeInCheck(piece, move, board, { castling: 'kingside', row: from.row })) return false;
      return true;
    }
    // Queenside castling.
    if (to.col === 2) {
      const rook = board[from.row][0];
      if (!rook || rook.type !== 'rook' || rook.hasMoved) return false;
      if (board[from.row][1] || board[from.row][2] || board[from.row][3]) return false;
      if (wouldKingBeInCheck(piece, move, board, { castling: 'queenside', row: from.row })) return false;
      return true;
    }
  }
  return false;
};

const wouldKingBeInCheck = (piece, move, board, options = {}) => {
  // Create a temporary board to simulate the move.
  const tempBoard = board.map(row => row.slice());
  const { from, to } = move;
  tempBoard[to.row][to.col] = { ...piece };
  tempBoard[from.row][from.col] = null;
  // If castling, also move the rook.
  if (options.castling === 'kingside') {
    const rook = tempBoard[options.row][7];
    tempBoard[options.row][5] = { ...rook, hasMoved: true };
    tempBoard[options.row][7] = null;
  }
  if (options.castling === 'queenside') {
    const rook = tempBoard[options.row][0];
    tempBoard[options.row][3] = { ...rook, hasMoved: true };
    tempBoard[options.row][0] = null;
  }
  // Find the king’s position.
  let kingPos = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = tempBoard[r][c];
      if (p && p.type === 'king' && p.color === piece.color) {
        kingPos = { row: r, col: c };
        break;
      }
    }
    if (kingPos) break;
  }
  // Check if any opponent piece can attack the king.
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = tempBoard[r][c];
      if (p && p.color !== piece.color) {
        if (isValidMoveForCheck(p, { from: { row: r, col: c }, to: kingPos }, tempBoard)) {
          return true;
        }
      }
    }
  }
  return false;
};

// A stripped-down version of move validation used for check detection.
const isValidMoveForCheck = (piece, move, board) => {
  const { from, to } = move;
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      if (Math.abs(dc) === 1 && dr === direction) return true;
      return false;
    }
    case 'rook':
      return validateRook(piece, move, board);
    case 'knight':
      return validateKnight(dr, dc);
    case 'bishop':
      return validateBishop(piece, move, board);
    case 'queen':
      return validateRook(piece, move, board) || validateBishop(piece, move, board);
    case 'king':
      return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
    default:
      return false;
  }
};

// Execute the move and perform any special moves (en passant, castling).
export const performSpecialMoves = (piece, move, board, enPassant) => {
  const { from, to } = move;
  // Deep copy the board.
  const newBoard = board.map(row => row.slice());

  // En passant capture.
  if (piece.type === 'pawn') {
    if (Math.abs(to.col - from.col) === 1 && !board[to.row][to.col]) {
      newBoard[from.row][to.col] = null;
    }
  }

  // Move the piece.
  newBoard[to.row][to.col] = { ...piece };
  newBoard[from.row][from.col] = null;

  let newEnPassant = null;
  // Set en passant square if pawn moves two squares.
  if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
    newEnPassant = {
      row: (from.row + to.row) / 2,
      col: from.col,
    };
  }

  // Handle castling: move the rook.
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    if (to.col === 6) { // kingside
      newBoard[from.row][5] = { ...newBoard[from.row][7], hasMoved: true };
      newBoard[from.row][7] = null;
    } else if (to.col === 2) { // queenside
      newBoard[from.row][3] = { ...newBoard[from.row][0], hasMoved: true };
      newBoard[from.row][0] = null;
    }
  }

  return { board: newBoard, enPassant: newEnPassant };
};


const coordsToSquare = (row, col) => {
  const files = 'abcdefgh';
  const rank = 8 - row; // row 0 is rank 8, row 7 is rank 1.
  return `${files[col]}${rank}`;
};

export const getMoveNotation = (piece, move, previousBoard, promotion) => {
  const fromSquare = coordsToSquare(move.from.row, move.from.col);
  const toSquare = coordsToSquare(move.to.row, move.to.col);

  // Detect castling (king moves two squares horizontally).
  if (piece.type === 'king' && Math.abs(move.to.col - move.from.col) === 2) {
    return move.to.col === 6 ? "O-O" : "O-O-O";
  }

  // Determine if the move was a capture.
  let capture = false;
  if (previousBoard && previousBoard[move.to.row][move.to.col] !== null) {
    capture = true;
  }

  // Determine the piece notation.
  let pieceNotation = '';
  if (piece.type !== 'pawn') {
    // Use uppercase first letter for pieces (except pawns).
    const notationMap = { king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N' };
    pieceNotation = notationMap[piece.type] || '';
  } else {
    // For pawn captures, include the originating file.
    if (capture) {
      const files = 'abcdefgh';
      pieceNotation = files[move.from.col];
    }
  }

  // Build the notation string.
  const captureNotation = capture ? "x" : "";
  const promotionNotation = promotion ? "=Q" : ""; // Auto-promote to Queen.
  return `${pieceNotation}${captureNotation}${toSquare}${promotionNotation}`;
};

// A simplified game status function.
export const getGameStatus = (board, turn) => {
  let kingPos = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'king' && piece.color === turn) {
        kingPos = { row: r, col: c };
        break;
      }
    }
    if (kingPos) break;
  }
  if (!kingPos) return 'Checkmate';

  let kingInCheck = false;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color !== turn) {
        if (isValidMoveForCheck(piece, { from: { row: r, col: c }, to: kingPos }, board)) {
          kingInCheck = true;
          break;
        }
      }
    }
    if (kingInCheck) break;
  }

  return kingInCheck ? "Check" : "";
};

// --- (Other helper functions: isValidMove, validatePawn, validateRook, validateKnight, validateBishop, validateKing, wouldKingBeInCheck, isValidMoveForCheck, performSpecialMoves) --- //

export {
  validateRook,
  validateKnight,
  validateBishop,
};

