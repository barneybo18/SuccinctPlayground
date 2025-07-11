"use client"
import { useState } from 'react';

type Cell = {
  isMine: boolean;
  isFriedEgg: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

const GRID_SIZE = 10;
const FRIED_EGG_COUNT = 10;
const MINE_COUNT = 10;

const initializeGrid = (): Cell[][] => {
  const grid: Cell[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        isMine: false,
        isFriedEgg: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );

  // Place fried eggs
  let eggsPlaced = 0;
  while (eggsPlaced < FRIED_EGG_COUNT) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    if (!grid[row][col].isFriedEgg && !grid[row][col].isMine) {
      grid[row][col].isFriedEgg = true;
      eggsPlaced++;
    }
  }

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < MINE_COUNT) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    if (!grid[row][col].isFriedEgg && !grid[row][col].isMine) {
      grid[row][col].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbor mines
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].isMine || grid[row][col].isFriedEgg) continue;
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

  const revealCell = (row: number, col: number) => {
    if (gameOver || gameWon || grid[row][col].isRevealed || grid[row][col].isFlagged) return;

    const newGrid = [...grid.map(row => [...row])];
    newGrid[row][col].isRevealed = true;

    if (grid[row][col].isMine) {
      setGameOver(true);
      return;
    }

    if (grid[row][col].neighborMines === 0 && !grid[row][col].isFriedEgg) {
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
    const eggCount = newGrid.flat().filter(cell => cell.isFriedEgg && cell.isRevealed).length;
    if (eggCount === FRIED_EGG_COUNT) {
      setGameWon(true);
    }
  };

  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver || gameWon || grid[row][col].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged;
    setGrid(newGrid);
  };

  const resetGame = () => {
    setGrid(initializeGrid());
    setGameOver(false);
    setGameWon(false);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-200">
        <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          🍳 Fried Sweeper 🍳
        </h1>
        
        <div className="mb-6 text-center">
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            ✨ New Game ✨
          </button>
        </div>
        
        <div
          className="grid gap-2 p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl shadow-inner border border-pink-200"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => revealCell(rowIndex, colIndex)}
                onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
                className={`w-11 h-11 flex items-center justify-center border-2 rounded-lg cursor-pointer transition-all duration-150 font-bold text-lg ${
                  cell.isRevealed
                    ? 'bg-white border-pink-300 shadow-inner'
                    : cell.isFlagged
                    ? 'bg-gradient-to-br from-pink-300 to-rose-300 border-pink-400 shadow-md'
                    : 'bg-gradient-to-br from-pink-200 to-rose-200 hover:from-pink-300 hover:to-rose-300 border-pink-300 shadow-md hover:shadow-lg transform hover:scale-105'
                } ${gameOver && cell.isMine ? 'bg-gradient-to-br from-red-400 to-pink-500 border-red-500' : ''}`}
              >
                {cell.isRevealed && !cell.isFriedEgg && !cell.isMine ? (
                  cell.neighborMines > 0 ? (
                    <span className={`${getNumberColor(cell.neighborMines)} font-bold text-lg`}>
                      {cell.neighborMines}
                    </span>
                  ) : (
                    ''
                  )
                ) : cell.isFlagged ? (
                  <span className="text-xl">🌸</span>
                ) : cell.isRevealed && cell.isFriedEgg ? (
                  <span className="text-xl">🍳</span>
                ) : cell.isRevealed && cell.isMine ? (
                  <span className="text-xl">💣</span>
                ) : (
                  ''
                )}
              </div>
            ))
          )}
        </div>
        
        {gameOver && (
          <div className="mt-6 text-center">
            <div className="text-2xl font-bold text-pink-700 bg-gradient-to-r from-pink-100 to-rose-100 p-4 rounded-2xl border-2 border-pink-300 shadow-lg">
              💥 Oh no! You got cooked by a mine! 💥
            </div>
          </div>
        )}
        
        {gameWon && (
          <div className="mt-6 text-center">
            <div className="text-2xl font-bold text-pink-700 bg-gradient-to-r from-pink-100 to-rose-100 p-4 rounded-2xl border-2 border-pink-300 shadow-lg animate-pulse">
              🎉 Eggcellent! You collected all the fried eggs! 🎉
            </div>
          </div>
        )}
      </div>
    </div>
  );
}