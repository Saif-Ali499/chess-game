import React from 'react';
import Piece from './Piece';

function Square({ row, col, piece, isSelected, onClick }) {
  const squareColor = (row + col) % 2 === 0 ? 'light' : 'dark';
  return (
    <div className={`square ${squareColor} ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      {piece && <Piece piece={piece} />}
    </div>
  );
}

export default Square;
