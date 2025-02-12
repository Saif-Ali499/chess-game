import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Square from './Square';
import { selectSquare } from '../redux/gameSlice';

function Board() {
  const board = useSelector((state) => state.game.board);
  const selected = useSelector((state) => state.game.selected);
  const dispatch = useDispatch();

  const handleSquareClick = (row, col) => {
    dispatch(selectSquare({ row, col }));
  };

  return (
    <div className="board">
      {board.map((rowData, rowIndex) => (
        <div key={rowIndex} className="row">
          {rowData.map((square, colIndex) => (
            <Square 
              key={colIndex} 
              row={rowIndex} 
              col={colIndex} 
              piece={square} 
              isSelected={selected && selected.row === rowIndex && selected.col === colIndex}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;
