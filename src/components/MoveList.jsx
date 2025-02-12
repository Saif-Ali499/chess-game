import React from 'react';
import { useSelector } from 'react-redux';

function MoveList() {
  const moveList = useSelector((state) => state.game.moveList);

  return (
    <div className="move-list">
      <h3>Move List</h3>
      <ol>
        {moveList.map((move, index) => (
          <li key={index}>{move}</li>
        ))}
      </ol>
    </div>
  );
}

export default MoveList;
