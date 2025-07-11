"use client"
import { useState } from 'react';

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

const GRID_SIZE = 8; // Reduced for better mobile fit
const MINE_COUNT = 10;

const initializeGrid = (): Cell[][] => {
  const grid: Cell[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < MINE_COUNT) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    if (!grid[row][col].isMine) {
      grid[row][col].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbor mines
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc].isMine) {
            count++;
          }
        }
      }
      grid[row][col].neighborMines = count;
    }
  }

  return grid;
};

export default function EggCollector() {
  const [grid, setGrid] = useState<Cell[][]>(initializeGrid());
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isFlaggingMode, setIsFlaggingMode] = useState(false); // For mobile toggle

  const revealCell = (row: number, col: number) => {
    if (gameOver || gameWon || grid[row][col].isRevealed || grid[row][col].isFlagged) return;

    const newGrid = [...grid.map(row => [...row])];
    newGrid[row][col].isRevealed = true;

    if (grid[row][col].isMine) {
      setGameOver(true);
      return;
    }

    if (grid[row][col].neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            revealCell(nr, nc);
          }
        }
      }
    }

    setGrid(newGrid);

    // Check win condition
    const unrevealedNonMines = newGrid.flat().filter(cell => !cell.isMine && !cell.isRevealed).length;
    if (unrevealedNonMines === 0) {
      setGameWon(true);
    }
  };

  const toggleFlag = (row: number, col: number) => {
    if (gameOver || gameWon || grid[row][col].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged;
    setGrid(newGrid);
  };

  const handleCellClick = (row: number, col: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isFlaggingMode) {
      toggleFlag(row, col);
    } else {
      revealCell(row, col);
    }
  };

  const handleTouchStart = (row: number, col: number, e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behaviors
    handleCellClick(row, col, e);
  };

  const resetGame = () => {
    setGrid(initializeGrid());
    setGameOver(false);
    setGameWon(false);
    setIsFlaggingMode(false);
  };

  const toggleFlaggingMode = () => {
    setIsFlaggingMode(!isFlaggingMode);
  };

  const getNumberColor = (count: number): string => {
    const colors = [
      'text-pink-600',    // 1
      'text-rose-600',    // 2
      'text-fuchsia-600', // 3
      'text-purple-600',  // 4
      'text-pink-800',    // 5
      'text-rose-800',    // 6
      'text-fuchsia-800', // 7
      'text-purple-800'   // 8
    ];
    return colors[count - 1] || 'text-pink-600';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-pink-200 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          🍳 Mine Sweeper 🍳
        </h1>

        <div className="mb-4 flex justify-between gap-2">
          <button
            onClick={resetGame}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-sm"
          >
            ✨ New Game
          </button>
          <button
            onClick={toggleFlaggingMode}
            className={`flex-1 px-4 py-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-sm ${
              isFlaggingMode
                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white'
                : 'bg-gradient-to-r from-pink-200 to-rose-200 text-pink-700'
            }`}
          >
            {isFlaggingMode ? 'Reveal Mode' : 'Flag Mode 🍳'}
          </button>
        </div>

        <div
          className="grid gap-1 p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl shadow-inner border border-pink-200 touch-none"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                onTouchStart={(e) => handleTouchStart(rowIndex, colIndex, e)}
                onContextMenu={(e) => e.preventDefault()} // Disable context menu
                className={`aspect-square flex items-center justify-center border-2 rounded-lg cursor-pointer transition-all duration-150 font-bold text-base ${
                  cell.isRevealed
                    ? 'bg-white border-pink-300 shadow-inner'
                    : cell.isFlagged
                    ? 'bg-gradient-to-br from-purple-300 to-fuchsia-300 border-purple-400 shadow-md'
                    : 'bg-gradient-to-br from-pink-200 to-rose-200 hover:from-pink-300 hover:to-rose-300 border-pink-300 shadow-md hover:shadow-lg'
                } ${gameOver && cell.isMine ? 'bg-gradient-to-br from-red-400 to-pink-500 border-red-500' : ''}`}
              >
                {cell.isRevealed && !cell.isMine ? (
                  cell.neighborMines > 0 ? (
                    <span className={`${getNumberColor(cell.neighborMines)} font-bold`}>
                      {cell.neighborMines}
                    </span>
                  ) : (
                    ''
                  )
                ) : cell.isFlagged ? (
                  <span className="text-lg">🍳</span>
                ) : cell.isRevealed && cell.isMine ? (
                  <span className="text-lg">💣</span>
                ) : (
                  ''
                )}
              </div>
            ))
          )}
        </div>

        {gameOver && (
          <div className="mt-4 text-center">
            <div className="text-lg font-bold text-pink-700 bg-gradient-to-r from-pink-100 to-rose-100 p-3 rounded-2xl border-2 border-pink-300 shadow-lg">
              💥 Oh no! You hit a mine! 💥
            </div>
          </div>
        )}

        {gameWon && (
          <div className="mt-4 text-center">
            <div className="text-lg font-bold text-pink-700 bg-gradient-to-r from-pink-100 to-rose-100 p-3 rounded-2xl border-2 border-pink-300 shadow-lg animate-pulse">
              🎉 Eggcellent! You cleared the board! 🎉
            </div>
          </div>
        )}
      </div>
    </div>
  );
}