import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { tickTimer } from "../redux/gameSlice";

function Timer() {
  const dispatch = useDispatch();
  const whiteTimer = useSelector((state) => state.game.whiteTimer);
  const blackTimer = useSelector((state) => state.game.blackTimer);
  const turn = useSelector((state) => state.game.turn);

  useEffect(() => {
    const timerId = setInterval(() => {
      dispatch(tickTimer());
    }, 1000);
    return () => clearInterval(timerId);
  }, [dispatch, turn]);
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="timer">
      <h3>White: {formatTime(whiteTimer)}</h3>
      <h3>Black: {formatTime(blackTimer)}</h3>
    </div>
  );
}

export default Timer;
