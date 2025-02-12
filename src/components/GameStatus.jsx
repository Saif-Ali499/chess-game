import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { undoMove, redoMove, restartGame } from "../redux/gameSlice";
import "../App.css";

function GameStatus() {
  const dispatch = useDispatch();

  return (
    <div>
      <div className="game-status">
        <button className="gameButton" onClick={() => dispatch(undoMove())}>
          Undo
        </button>
        <button className="gameButton" onClick={() => dispatch(redoMove())}>
          Redo
        </button>
        <button className="gameButton" onClick={() => dispatch(restartGame())}>
          Restart
        </button>
      </div>
    </div>
  );
}

export default GameStatus;
