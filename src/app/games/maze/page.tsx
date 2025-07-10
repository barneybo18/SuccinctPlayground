"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings, Zap, Target, Clock, Trophy, ArrowLeft } from 'lucide-react';

const Maze = () => {
  const [mazeSize, setMazeSize] = useState(21);
  const [maze, setMaze] = useState<number[][]>([]);
  const [solution, setSolution] = useState<[number, number][]>([]);
  const [visitedCells, setVisitedCells] = useState<[number, number][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [generationAlgorithm, setGenerationAlgorithm] = useState('recursive');
  const [solvingAlgorithm, setSolvingAlgorithm] = useState('astar');
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState({ generationTime: 0, solvingTime: 0, pathLength: 0 });
  const timeoutRef = useRef(null);

  // Initialize maze
  const initializeMaze = useCallback(() => {
    const newMaze = Array(mazeSize).fill(null).map(() => 
      Array(mazeSize).fill(1) // 1 = wall, 0 = path
    );
    setMaze(newMaze);
    setSolution([]);
    setVisitedCells([]);
    setStats({ generationTime: 0, solvingTime: 0, pathLength: 0 });
  }, [mazeSize]);

  useEffect(() => {
    initializeMaze();
  }, [initializeMaze]);

  // Maze generation algorithms
  const generateMazeRecursive = useCallback(async (maze: number[][]) => {
    const visited = Array(mazeSize).fill(null).map(() => Array(mazeSize).fill(false));
    const stack = [];
    const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];
    
    // Start from top-left corner
    let currentRow = 1, currentCol = 1;
    maze[currentRow][currentCol] = 0;
    visited[currentRow][currentCol] = true;
    stack.push([currentRow, currentCol]);

    while (stack.length > 0) {
      const neighbors = [];
      
      for (const [dr, dc] of directions) {
        const newRow = currentRow + dr;
        const newCol = currentCol + dc;
        
        if (newRow >= 1 && newRow < mazeSize - 1 && 
            newCol >= 1 && newCol < mazeSize - 1 && 
            !visited[newRow][newCol]) {
          neighbors.push([newRow, newCol]);
        }
      }

      if (neighbors.length > 0) {
        const [nextRow, nextCol] = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Remove wall between current and next cell
        maze[currentRow + (nextRow - currentRow) / 2][currentCol + (nextCol - currentCol) / 2] = 0;
        maze[nextRow][nextCol] = 0;
        visited[nextRow][nextCol] = true;
        
        stack.push([nextRow, nextCol]);
        currentRow = nextRow;
        currentCol = nextCol;
      } else {
        [currentRow, currentCol] = stack.pop() || [1, 1];
      }

      // Update maze state for animation
      setMaze([...maze]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
  }, [mazeSize, animationSpeed]);

  const generateMazePrim = useCallback(async (maze: number[][]) => {
    const walls: [number, number, number, number][] = [];
    const directions: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    
    // Start with a random cell
    const startRow = 1;
    const startCol = 1;
    maze[startRow][startCol] = 0;
    
    // Add walls of the starting cell
    for (const [dr, dc] of directions) {
      const wallRow = startRow + dr;
      const wallCol = startCol + dc;
      if (wallRow >= 0 && wallRow < mazeSize && wallCol >= 0 && wallCol < mazeSize) {
        walls.push([wallRow, wallCol, startRow, startCol]);
      }
    }

    while (walls.length > 0) {
      const randomIndex = Math.floor(Math.random() * walls.length);
      const [wallRow, wallCol, cellRow, cellCol]: [number, number, number, number] = walls[randomIndex];
      walls.splice(randomIndex, 1);

      const oppositeRow: number = wallRow + (wallRow - cellRow);
      const oppositeCol: number = wallCol + (wallCol - cellCol);

      if (
        oppositeRow >= 1 &&
        oppositeRow < mazeSize - 1 &&
        oppositeCol >= 1 &&
        oppositeCol < mazeSize - 1 &&
        maze[oppositeRow][oppositeCol] === 1
      ) {
        maze[wallRow][wallCol] = 0;
        maze[oppositeRow][oppositeCol] = 0;

        // Add new walls
        for (const [dr, dc] of directions) {
          const newWallRow: number = oppositeRow + dr;
          const newWallCol: number = oppositeCol + dc;
          if (
            newWallRow >= 0 &&
            newWallRow < mazeSize &&
            newWallCol >= 0 &&
            newWallCol < mazeSize &&
            maze[newWallRow][newWallCol] === 1
          ) {
            walls.push([newWallRow, newWallCol, oppositeRow, oppositeCol]);
          }
        }
      }

      setMaze([...maze]);
      await new Promise((resolve) => setTimeout(resolve, animationSpeed));
    }
  }, [mazeSize, animationSpeed]);

  // Pathfinding algorithms
  const solveMazeAStar = useCallback(async (maze: number[][]) => {
    const startRow = 1, startCol = 1;
    const endRow = mazeSize - 2, endCol = mazeSize - 2;
    const openSet: [number, number, number, number][] = [
      [startRow, startCol, 0, heuristic(startRow, startCol, endRow, endCol)]
    ];
    const cameFrom: Record<string, string> = {};
    const gScore: Record<string, number> = {};
    const fScore: Record<string, number> = {};
    const visited = new Set<string>();

    gScore[`${startRow},${startCol}`] = 0;
    fScore[`${startRow},${startCol}`] = heuristic(startRow, startCol, endRow, endCol);

    function heuristic(row1: number, col1: number, row2: number, col2: number) {
      return Math.abs(row1 - row2) + Math.abs(col1 - col2);
    }

    while (openSet.length > 0) {
      openSet.sort((a, b) => a[3] - b[3]);
      const [currentRow, currentCol, currentG, currentF] = openSet.shift() as [number, number, number, number];

      if (currentRow === endRow && currentCol === endCol) {
        // Reconstruct path
        const path: [number, number][] = [];
        let current = `${currentRow},${currentCol}`;
        while (current in cameFrom) {
          const [row, col] = current.split(',').map(Number);
          path.unshift([row, col]);
          current = cameFrom[current];
        }
        path.unshift([startRow, startCol]);

        // Animate path
        for (const [row, col] of path) {
          setSolution((prev) => [...prev, [row, col]]);
          await new Promise((resolve) => setTimeout(resolve, animationSpeed));
        }
        return path;
      }

      visited.add(`${currentRow},${currentCol}`);
      setVisitedCells((prev) => [...prev, [currentRow, currentCol]]);

      const directions: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dr, dc] of directions) {
        const newRow = currentRow + dr;
        const newCol = currentCol + dc;
        const neighborKey = `${newRow},${newCol}`;

        if (
          newRow >= 0 &&
          newRow < mazeSize &&
          newCol >= 0 &&
          newCol < mazeSize &&
          maze[newRow][newCol] === 0 &&
          !visited.has(neighborKey)
        ) {
          const tentativeG = gScore[`${currentRow},${currentCol}`] + 1;

          if (!(neighborKey in gScore) || tentativeG < gScore[neighborKey]) {
            cameFrom[neighborKey] = `${currentRow},${currentCol}`;
            gScore[neighborKey] = tentativeG;
            fScore[neighborKey] = tentativeG + heuristic(newRow, newCol, endRow, endCol);
            
            const existingIndex = openSet.findIndex(([r, c]) => r === newRow && c === newCol);
            if (existingIndex === -1) {
              openSet.push([newRow, newCol, tentativeG, fScore[neighborKey]]);
            }
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, animationSpeed));
    }
    return [];
  }, [mazeSize, animationSpeed]);

  const solveMazeDijkstra = useCallback(async (maze: number[][]) => {
    const startRow = 1, startCol = 1;
    const endRow = mazeSize - 2, endCol = mazeSize - 2;
    const distances: Record<string, number> = {};
    const previous: Record<string, string | undefined> = {};
    const unvisited = new Set<string>();

    // Initialize distances
    for (let row = 0; row < mazeSize; row++) {
      for (let col = 0; col < mazeSize; col++) {
        if (maze[row][col] === 0) {
          const key = `${row},${col}`;
          distances[key] = row === startRow && col === startCol ? 0 : Infinity;
          unvisited.add(key);
        }
      }
    }

    while (unvisited.size > 0) {
      let current: string | null = null;
      let minDistance = Infinity;

      for (const node of unvisited) {
        if (distances[node] < minDistance) {
          minDistance = distances[node];
          current = node;
        }
      }

      if (!current || minDistance === Infinity) break;

      unvisited.delete(current);
      const [currentRow, currentCol] = current.split(',').map(Number);

      setVisitedCells((prev) => [...prev, [currentRow, currentCol]]);

      if (currentRow === endRow && currentCol === endCol) {
        // Reconstruct path
        const path: [number, number][] = [];
        let node: string | undefined = current;
        while (node) {
          const [row, col] = node.split(',').map(Number);
          path.unshift([row, col]);
          node = previous[node];
        }

        // Animate path
        for (const [row, col] of path) {
          setSolution((prev) => [...prev, [row, col]]);
          await new Promise((resolve) => setTimeout(resolve, animationSpeed));
        }
        return path;
      }

      const directions: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dr, dc] of directions) {
        const newRow = currentRow + dr;
        const newCol = currentCol + dc;
        const neighborKey = `${newRow},${newCol}`;

        if (unvisited.has(neighborKey)) {
          const alt = distances[current] + 1;
          if (alt < distances[neighborKey]) {
            distances[neighborKey] = alt;
            previous[neighborKey] = current;
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, animationSpeed));
    }
    return [];
  }, [mazeSize, animationSpeed]);

  const generateMaze = async () => {
    if (isGenerating || isSolving) return;
    
    setIsGenerating(true);
    setSolution([]);
    setVisitedCells([]);
    
    const startTime = Date.now();
    const newMaze = Array(mazeSize).fill(null).map(() => Array(mazeSize).fill(1));
    
    if (generationAlgorithm === 'recursive') {
      await generateMazeRecursive(newMaze);
    } else if (generationAlgorithm === 'prim') {
      await generateMazePrim(newMaze);
    }
    
    const endTime = Date.now();
    setStats(prev => ({ ...prev, generationTime: endTime - startTime }));
    setIsGenerating(false);
  };

  const solveMaze = async () => {
    if (isSolving || isGenerating) return;
    
    setIsSolving(true);
    setSolution([]);
    setVisitedCells([]);
    
    const startTime = Date.now();
    let path = [];
    
    if (solvingAlgorithm === 'astar') {
      path = await solveMazeAStar(maze);
    } else if (solvingAlgorithm === 'dijkstra') {
      path = await solveMazeDijkstra(maze);
    }
    
    const endTime = Date.now();
    setStats(prev => ({ 
      ...prev, 
      solvingTime: endTime - startTime,
      pathLength: path.length 
    }));
    setIsSolving(false);
  };

  const resetMaze = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsGenerating(false);
    setIsSolving(false);
    initializeMaze();
  };

  const getCellClass = (row: number, col: number) => {
    const isStart = row === 1 && col === 1;
    const isEnd = row === mazeSize - 2 && col === mazeSize - 2;
    const isPath = maze[row] && maze[row][col] === 0;
    const isVisited = visitedCells.some(([r, c]) => r === row && c === col);
    const isSolution = solution.some(([r, c]) => r === row && c === col);

    if (isStart) return 'bg-green-500';
    if (isEnd) return 'bg-red-500';
    if (isSolution) return 'bg-yellow-400';
    if (isVisited) return 'bg-blue-300';
    if (isPath) return 'bg-gray-100';
    return 'bg-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto relative">
        <Link href="/dashboard" passHref>
          <Button variant="ghost" className="absolute top-4 left-4 text-white hover:bg-white/20 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        {/* Header */}
        <div className="text-center mb-6 pt-12 md:pt-0">
          <h1 className="text-4xl font-bold text-white mb-2">Maze Generator &amp; Solver</h1>
          <p className="text-blue-200">Watch algorithms create and solve mazes in real-time</p>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 shadow-xl">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <button
              onClick={generateMaze}
              disabled={isGenerating || isSolving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Maze'}
            </button>
            
            <button
              onClick={solveMaze}
              disabled={isSolving || isGenerating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              {isSolving ? 'Solving...' : 'Solve Maze'}
            </button>
            
            <button
              onClick={resetMaze}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 shadow-xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Maze Size</label>
                <select
                  value={mazeSize}
                  onChange={(e) => setMazeSize(Number(e.target.value))}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white"
                >
                  <option value={15}>15x15</option>
                  <option value={21}>21x21</option>
                  <option value={31}>31x31</option>
                  <option value={41}>41x41</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Generation Algorithm</label>
                <select
                  value={generationAlgorithm}
                  onChange={(e) => setGenerationAlgorithm(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white"
                >
                  <option value="recursive">Recursive Backtracking</option>
                  <option value="prim">Prim's Algorithm</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Solving Algorithm</label>
                <select
                  value={solvingAlgorithm}
                  onChange={(e) => setSolvingAlgorithm(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white"
                >
                  <option value="astar">A* Search</option>
                  <option value="dijkstra">Dijkstra's Algorithm</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Animation Speed</label>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white"
                >
                  <option value={10}>Very Fast</option>
                  <option value={50}>Fast</option>
                  <option value={100}>Medium</option>
                  <option value={200}>Slow</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 shadow-xl">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold">Generation Time</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{stats.generationTime}ms</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">Solving Time</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{stats.solvingTime}ms</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Path Length</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{stats.pathLength}</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 shadow-xl">
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-white text-sm">Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-white text-sm">End</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span className="text-white text-sm">Path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded"></div>
              <span className="text-white text-sm">Wall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-300 rounded"></div>
              <span className="text-white text-sm">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-white text-sm">Solution</span>
            </div>
          </div>
        </div>

        {/* Maze Grid */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-xl">
          <div className="overflow-auto max-h-96">
            <div 
              className="grid gap-0 mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${mazeSize}, 1fr)`,
                width: 'fit-content'
              }}
            >
              {maze.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-3 h-3 ${getCellClass(rowIndex, colIndex)} transition-colors duration-200`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maze;