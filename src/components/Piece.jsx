import React from 'react';

const getPieceUnicode = (piece) => {
  if (!piece) return '';
  const { type, color } = piece;
  const black = {
    king: "\u265A",
    queen: "\u265B",
    rook: "\u265C",
    bishop: "\u265D",
    knight: "\u265E",
    pawn: "\u265F",
  };
  const white = {
    king: "\u2654",
    queen: "\u2655",
    rook: "\u2656",
    bishop: "\u2657",
    knight: "\u2658",
    pawn: "\u2659",
  };
  return color === 'white' ? white[type] : black[type];
};

function Piece({ piece }) {
  return <span className="piece">{getPieceUnicode(piece)}</span>;
}

export default Piece;
