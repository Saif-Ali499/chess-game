import React from "react";
import Board from "./components/Board";
import GameStatus from "./components/GameStatus";
import Timer from "./components/Timer";
import MoveList from "./components/MoveList";
import { useState } from "react";
import { useSelector } from "react-redux";

function App() {
  const [start, setStart] = useState(false);
  const turn = useSelector((state) => state.game.turn);
  const status = useSelector((state) => state.game.status);
  if (!start) {
    return (
      <div className="initial">
        <button className="startButton" onClick={(e) => setStart(true)}>
          Start The Game
        </button>
        <Board />
      </div>
    );
  } else {
    return (
      <div className="game">
        <GameStatus />
        <Timer />
        <div>
          {status && (
            <h3 className="text-3xl text-red-500 font-extrabold">{status}</h3>
          )}
          <h2 className="w-[30.2rem] bg-slate-500 text-white text-3xl">
            Turn: {turn}
          </h2>
          <Board />
        </div>

        <MoveList />
      </div>
    );
  }
}

export default App;
