import { createSlice } from "@reduxjs/toolkit";
import {
  isValidMove,
  performSpecialMoves,
  getGameStatus,
  getMoveNotation,
} from "../utils/ChessRules";

const initialBoard = () => {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Place pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: "pawn", color: "black", hasMoved: false };
    board[6][i] = { type: "pawn", color: "white", hasMoved: false };
  }
  // Place rooks
  board[0][0] = board[0][7] = { type: "rook", color: "black", hasMoved: false };
  board[7][0] = board[7][7] = { type: "rook", color: "white", hasMoved: false };
  // Place knights
  board[0][1] = board[0][6] = { type: "knight", color: "black" };
  board[7][1] = board[7][6] = { type: "knight", color: "white" };
  // Place bishops
  board[0][2] = board[0][5] = { type: "bishop", color: "black" };
  board[7][2] = board[7][5] = { type: "bishop", color: "white" };
  // Place queens
  board[0][3] = { type: "queen", color: "black" };
  board[7][3] = { type: "queen", color: "white" };
  // Place kings
  board[0][4] = { type: "king", color: "black", hasMoved: false };
  board[7][4] = { type: "king", color: "white", hasMoved: false };

  return board;
};

const initialState = {
  board: initialBoard(),
  selected: null,
  turn: "white",
  history: [],
  future: [],
  status: "",
  enPassant: null,
  whiteTimer: 600,
  blackTimer: 600,
  moveList: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    selectSquare: (state, action) => {
      const { row, col } = action.payload;
      const piece = state.board[row][col];

      // If already selected, try to move the piece.
      if (state.selected) {
        const selectedPiece =
          state.board[state.selected.row][state.selected.col];

        // If selecting another piece of the same color, update selection.
        if (piece && piece.color === state.turn) {
          state.selected = { row, col };
          return;
        }
        const move = { from: state.selected, to: { row, col } };

        // Validate the move using the chess rules utility.
        if (isValidMove(selectedPiece, move, state.board, state.enPassant)) {
          // Save current state for undo.
          state.history.push({
            board: JSON.parse(JSON.stringify(state.board)),
            turn: state.turn,
            enPassant: state.enPassant,
            whiteTimer: state.whiteTimer,
            blackTimer: state.blackTimer,
            moveList: [...state.moveList],
          });

          // Clear any future moves (for redo).
          state.future = [];
          const previousBoard = JSON.parse(JSON.stringify(state.board));
          const result = performSpecialMoves(
            selectedPiece,
            move,
            state.board,
            state.enPassant
          );
          state.board = result.board;
          state.enPassant = result.enPassant;

          if (state.board[move.to.row][move.to.col]) {
            state.board[move.to.row][move.to.col].hasMoved = true;
          }
          let promotion = false;
          if (
            selectedPiece.type === "pawn" &&
            (move.to.row === 0 || move.to.row === 7)
          ) {
            state.board[move.to.row][move.to.col].type = "queen";
            promotion = true;
          }
          const notation = getMoveNotation(
            selectedPiece,
            move,
            previousBoard,
            promotion
          );
          state.moveList.push(notation);
          state.turn = state.turn === "white" ? "black" : "white";
          state.selected = null;
          state.status = getGameStatus(state.board, state.turn);
        } else {
          state.selected = null;
        }
      } else {
        if (piece && piece.color === state.turn) {
          state.selected = { row, col };
        }
      }
    },
    undoMove: (state) => {
      if (state.history.length > 0) {
        const last = state.history.pop();
        state.future.push({
          board: JSON.parse(JSON.stringify(state.board)),
          turn: state.turn,
          enPassant: state.enPassant,
          whiteTimer: state.whiteTimer,
          blackTimer: state.blackTimer,
          moveList: [...state.moveList],
        });
        state.board = last.board;
        state.turn = last.turn;
        state.enPassant = last.enPassant;
        state.whiteTimer = last.whiteTimer;
        state.blackTimer = last.blackTimer;
        state.moveList = last.moveList;
        state.selected = null;
        state.status = getGameStatus(state.board, state.turn);
      }
    },
    redoMove: (state) => {
      if (state.future.length > 0) {
        const next = state.future.pop();
        state.history.push({
          board: JSON.parse(JSON.stringify(state.board)),
          turn: state.turn,
          enPassant: state.enPassant,
          whiteTimer: state.whiteTimer,
          blackTimer: state.blackTimer,
          moveList: [...state.moveList],
        });
        state.board = next.board;
        state.turn = next.turn;
        state.enPassant = next.enPassant;
        state.whiteTimer = next.whiteTimer;
        state.blackTimer = next.blackTimer;
        state.moveList = next.moveList;
        state.selected = null;
        state.status = getGameStatus(state.board, state.turn);
      }
    },
    restartGame: (state) => {
      state.board = initialBoard();
      state.turn = "white";
      state.selected = null;
      state.history = [];
      state.future = [];
      state.enPassant = null;
      state.whiteTimer = 600;
      state.blackTimer = 600;
      state.moveList = [];
      state.status = "";
    },
    tickTimer: (state) => {
      if (state.turn === "white") {
        if (state.whiteTimer > 0) state.whiteTimer -= 1;
        else state.status = "Time over: White loses";
      } else {
        if (state.blackTimer > 0) state.blackTimer -= 1;
        else state.status = "Time over: Black loses";
      }
    },
  },
});

export const { selectSquare, undoMove, redoMove, restartGame, tickTimer } =
  gameSlice.actions;
export default gameSlice.reducer;
