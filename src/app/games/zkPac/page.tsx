"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sketch } from 'react-p5-wrapper';
import type { P5WrapperProps } from 'react-p5-wrapper';

// Dynamic import for client-side rendering
const P5Wrapper = dynamic(() => import('react-p5-wrapper').then((mod) => mod.ReactP5Wrapper), {
  ssr: false,
});

interface PacMan {
  x: number;
  y: number;
  dir: string;
  speed: number;
}

interface Ghost {
  x: number;
  y: number;
  color: number[];
  name: string;
  frightened: boolean;
  dir?: string;
}

interface Dot {
  x: number;
  y: number;
  eaten: boolean;
}

interface GPU {
  x: number;
  y: number;
  eaten: boolean;
}

const teamColors: { [key: string]: number[] } = {
  blue: [0, 0, 255],
  pink: [255, 105, 180],
  green: [0, 255, 0],
  purple: [128, 0, 128],
  orange: [255, 165, 0],
};

const PacManGame: React.FC = () => {
  const [gameState, setGameState] = useState<'teamSelect' | 'playing'>('teamSelect');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const sketch: P5WrapperProps['sketch'] = (p5) => {
    let pacman: PacMan = { x: 1, y: 1, dir: 'right', speed: 1 };
    let ghosts: Ghost[] = [
      { x: 13, y: 17, color: [255, 0, 0], name: 'Blinky', frightened: false },
      { x: 14, y: 17, color: [255, 105, 180], name: 'Pinky', frightened: false },
      { x: 13, y: 18, color: [0, 255, 255], name: 'Inky', frightened: false },
      { x: 14, y: 18, color: [255, 165, 0], name: 'Clyde', frightened: false },
    ];
    let dots: Dot[] = [];
    let gpus: GPU[] = [
      { x: 2, y: 2, eaten: false },
      { x: 25, y: 2, eaten: false },
      { x: 2, y: 33, eaten: false },
      { x: 25, y: 33, eaten: false },
    ];
    let score = 0;
    let frightenedTimer = 0;
    const tileSize = 8;
    const mazeWidth = 28;
    const mazeHeight = 36;

    const maze = [
      // S (4x6 block, starting at (2,2))
      "    ####      ",
      "    #  #      ",
      "    ###       ",
      "    #         ",
      "    #         ",
      "    ####      ",
      // U (4x6 block, starting at (7,2))
      "     #  #     ",
      "     #  #     ",
      "     #  #     ",
      "     #  #     ",
      "     #  #     ",
      "     ####     ",
      // C (4x6 block, starting at (12,2))
      "      ####    ",
      "      #       ",
      "      #       ",
      "      #       ",
      "      #       ",
      "      ####    ",
      // C (4x6 block, starting at (17,2))
      "       ####   ",
      "       #      ",
      "       #      ",
      "       #      ",
      "       #      ",
      "       ####   ",
      // I (2x6 block, starting at (22,2))
      "        ##    ",
      "        ##    ",
      "        ##    ",
      "        ##    ",
      "        ##    ",
      "        ##    ",
      // N (4x6 block, starting at (25,2))
      "         #  # ",
      "         ## # ",
      "         # ## ",
      "         #  # ",
      "         #  # ",
      "         #  # ",
      // C (4x6 block, starting at (2,10))
      "    ####      ",
      "    #         ",
      "    #         ",
      "    #         ",
      "    #         ",
      "    ####      ",
      // T (4x6 block, starting at (7,10))
      "     ####     ",
      "      ##      ",
      "      ##      ",
      "      ##      ",
      "      ##      ",
      "      ##      ",
      ...Array(24).fill(" ".repeat(28)),
    ].map((row) => row.split(''));

    // Initialize dots
    for (let y = 0; y < mazeHeight; y++) {
      for (let x = 0; x < mazeWidth; x++) {
        if (maze[y][x] === '.') {
          dots.push({ x, y, eaten: false });
        }
      }
    }

    p5.setup = () => {
      p5.createCanvas(mazeWidth * tileSize, mazeHeight * tileSize);
    };

    p5.draw = () => {
      if (gameState === 'teamSelect') {
        // Team selection handled by React
      } else if (gameState === 'playing') {
        p5.background(0);
        // Draw maze
        for (let y = 0; y < mazeHeight; y++) {
          for (let x = 0; x < mazeWidth; x++) {
            if (maze[y][x] === '#') {
              p5.fill(128, 128, 128); // Grey walls
              p5.rect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
          }
        }
        // Draw dots
        for (let dot of dots) {
          if (!dot.eaten) {
            p5.fill(255);
            p5.ellipse((dot.x + 0.5) * tileSize, (dot.y + 0.5) * tileSize, tileSize / 4);
          }
        }
        // Draw GPUs
        for (let gpu of gpus) {
          if (!gpu.eaten) {
            p5.fill(...(teamColors[selectedTeam!] || [255, 255, 255]));
            p5.rect((gpu.x + 0.25) * tileSize, (gpu.y + 0.25) * tileSize, tileSize / 2, tileSize / 2);
          }
        }
        // Draw Pac-Man
        p5.fill(252, 234, 63); // Yellow
        const pacmanAngle = {
          right: [0, p5.PI],
          left: [p5.PI, p5.TWO_PI],
          up: [p5.PI / 2, 3 * p5.PI / 2],
          down: [3 * p5.PI / 2, 5 * p5.PI / 2],
        }[pacman.dir] || [0, p5.TWO_PI];
        p5.arc((pacman.x + 0.5) * tileSize, (pacman.y + 0.5) * tileSize, tileSize, tileSize, ...pacmanAngle);
        // Draw ghosts
        for (let ghost of ghosts) {
          p5.fill(ghost.frightened ? [0, 0, 255] : ghost.color);
          p5.rect((ghost.x + 0.25) * tileSize, (ghost.y + 0.25) * tileSize, tileSize / 2, tileSize / 2, 5);
        }
        // Draw score
        p5.fill(255);
        p5.textSize(12);
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.text(`Score: ${score}`, 10, 10);

        // Update game
        let newX = pacman.x;
        let newY = pacman.y;
        if (pacman.dir === 'right') newX += pacman.speed / p5.frameRate();
        if (pacman.dir === 'left') newX -= pacman.speed / p5.frameRate();
        if (pacman.dir === 'up') newY -= pacman.speed / p5.frameRate();
        if (pacman.dir === 'down') newY += pacman.speed / p5.frameRate();
        if (canMove(newX, newY)) {
          pacman.x = newX;
          pacman.y = newY;
        }
        // Check collisions
        for (let dot of dots) {
          if (!dot.eaten && p5.dist(pacman.x, pacman.y, dot.x, dot.y) < 0.5) {
            dot.eaten = true;
            score += 10;
          }
        }
        for (let gpu of gpus) {
          if (!gpu.eaten && p5.dist(pacman.x, pacman.y, gpu.x, gpu.y) < 0.5) {
            gpu.eaten = true;
            score += 50;
            ghosts.forEach((g) => (g.frightened = true));
            frightenedTimer = p5.frameRate() * 5;
          }
        }
        if (frightenedTimer > 0) {
          frightenedTimer--;
          if (frightenedTimer <= 0) {
            ghosts.forEach((g) => (g.frightened = false));
          }
        }
        for (let ghost of ghosts) {
          if (p5.dist(pacman.x, pacman.y, ghost.x, ghost.y) < 0.5) {
            if (ghost.frightened) {
              ghost.x = 13;
              ghost.y = 17;
              score += 200;
            } else {
              pacman.x = 1;
              pacman.y = 1;
              ghosts.forEach((g, i) => {
                g.x = 13 + (i % 2);
                g.y = 17 + Math.floor(i / 2);
              });
              score -= 100;
            }
          }
        }
        // Update ghosts
        for (let ghost of ghosts) {
          if (p5.frameCount % 30 === 0) {
            const directions = ['up', 'down', 'left', 'right'].filter((dir) => {
              const testX = ghost.x + (dir === 'right' ? 1 : dir === 'left' ? -1 : 0);
              const testY = ghost.y + (dir === 'down' ? 1 : dir === 'up' ? -1 : 0);
              return canMove(testX, testY);
            });
            ghost.dir = p5.random(directions);
          }
          if (ghost.dir) {
            const speed = ghost.frightened ? 0.5 : 0.8;
            ghost.x += (ghost.dir === 'right' ? speed : ghost.dir === 'left' ? -speed : 0) / p5.frameRate();
            ghost.y += (ghost.dir === 'down' ? speed : ghost.dir === 'up' ? -speed : 0) / p5.frameRate();
          }
        }
        // Check win condition
        if (dots.every((d) => d.eaten) && gpus.every((g) => g.eaten)) {
          setGameState('teamSelect');
          resetGame();
        }
      }
    };

    p5.keyPressed = () => {
      if (gameState === 'playing') {
        if (p5.keyCode === p5.RIGHT_ARROW) pacman.dir = 'right';
        if (p5.keyCode === p5.LEFT_ARROW) pacman.dir = 'left';
        if (p5.keyCode === p5.UP_ARROW) pacman.dir = 'up';
        if (p5.keyCode === p5.DOWN_ARROW) pacman.dir = 'down';
      }
    };

    const canMove = (x: number, y: number): boolean => {
      const tileX = Math.floor(x);
      const tileY = Math.floor(y);
      return tileX >= 0 && tileX < mazeWidth && tileY >= 0 && tileY < mazeHeight && maze[tileY][tileX] !== '#';
    };

    const resetGame = () => {
      pacman = { x: 1, y: 1, dir: 'right', speed: 1 };
      ghosts = [
        { x: 13, y: 17, color: [255, 0, 0], name: 'Blinky', frightened: false },
        { x: 14, y: 17, color: [255, 105, 180], name: 'Pinky', frightened: false },
        { x: 13, y: 18, color: [0, 255, 255], name: 'Inky', frightened: false },
        { x: 14, y: 18, color: [255, 165, 0], name: 'Clyde', frightened: false },
      ];
      dots = [];
      for (let y = 0; y < mazeHeight; y++) {
        for (let x = 0; x < mazeWidth; x++) {
          if (maze[y][x] === '.') {
            dots.push({ x, y, eaten: false });
          }
        }
      }
      gpus = [
        { x: 2, y: 2, eaten: false },
        { x: 25, y: 2, eaten: false },
        { x: 2, y: 33, eaten: false },
        { x: 25, y: 33, eaten: false },
      ];
      score = 0;
      frightenedTimer = 0;
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
      {gameState === 'teamSelect' && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-8">Select Your Team</h1>
          <div className="flex flex-col gap-4">
            {Object.keys(teamColors).map((team) => (
              <button
                key={team}
                className={`px-8 py-4 rounded-lg text-white font-semibold ${team === 'blue' ? 'bg-blue-500' : team === 'pink' ? 'bg-pink-500' : team === 'green' ? 'bg-green-500' : team === 'purple' ? 'bg-purple-500' : 'bg-orange-500'}`}
                onClick={() => {
                  setSelectedTeam(team);
                  setGameState('playing');
                }}
              >
                {team.charAt(0).toUpperCase() + team.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      {gameState === 'playing' && (
        <div className="border-4 border-gray-500 bg-gray-800 p-4 rounded-lg">
          <P5Wrapper sketch={sketch} />
        </div>
      )}
    </div>
  );
};

export default PacManGame;