"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Egg {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: 'normal' | 'golden' | 'rotten';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const EggCatcherGame: React.FC = () => {
  const [basketColumn, setBasketColumn] = useState(2);
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [eggSpawnRate, setEggSpawnRate] = useState(0.02);
  const [nextEggId, setNextEggId] = useState(0);
  const [nextParticleId, setNextParticleId] = useState(0);

  const gameWidth = 500;
  const gameHeight = 600;
  const numColumns = 5;
  const columnWidth = gameWidth / numColumns;
  const basketWidth = 50;
  const basketHeight = 40;
  const eggSize = 24;
  const basketX = (basketColumn + 0.5) * columnWidth;

  const createParticles = useCallback((x: number, y: number, color: string, count: number = 8) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: nextParticleId + i,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color: color
      });
    }
    setNextParticleId(prev => prev + count);
    setParticles(prev => [...prev, ...newParticles]);
  }, [nextParticleId]);

  const spawnEgg = useCallback(() => {
    if (!gameRunning) return;
    
    const randomColumn = Math.floor(Math.random() * numColumns);
    const eggX = (randomColumn + 0.5) * columnWidth - eggSize / 2;
    const eggType = Math.random() < 0.1 ? 'golden' : Math.random() < 0.05 ? 'rotten' : 'normal';
    const newEgg: Egg = {
      id: nextEggId,
      x: eggX,
      y: -eggSize,
      speed: 2 + Math.random() * 2 + level * 0.5,
      type: eggType
    };
    
    setEggs(prev => [...prev, newEgg]);
    setNextEggId(prev => prev + 1);
  }, [gameRunning, nextEggId, level, numColumns, columnWidth, eggSize]);

  const checkCollision = useCallback((egg: Egg) => {
    const eggCenterX = egg.x + eggSize / 2;
    const eggBottom = egg.y + eggSize;
    const basketLeft = basketX - basketWidth / 2;
    const basketRight = basketX + basketWidth / 2;
    const basketTop = gameHeight - basketHeight - 20;
    
    return (
      eggCenterX >= basketLeft &&
      eggCenterX <= basketRight &&
      eggBottom >= basketTop &&
      eggBottom <= gameHeight - 20
    );
  }, [basketX]);

  const gameLoop = useCallback(() => {
    if (!gameRunning || gameOver) return;

    // Spawn eggs
    if (Math.random() < eggSpawnRate) {
      spawnEgg();
    }

    // Update eggs
    setEggs(prev => {
      const updatedEggs = prev.map(egg => ({
        ...egg,
        y: egg.y + egg.speed
      }));

      // Check collisions and remove caught eggs
      const remainingEggs = updatedEggs.filter(egg => {
        if (checkCollision(egg)) {
          // Caught egg
          if (egg.type === 'golden') {
            setScore(s => s + 50);
            createParticles(egg.x + eggSize/2, egg.y + eggSize/2, '#FFD700', 12);
          } else if (egg.type === 'rotten') {
            setLives(l => l - 1);
            createParticles(egg.x + eggSize/2, egg.y + eggSize/2, '#8B4513', 8);
          } else {
            setScore(s => s + 10);
            createParticles(egg.x + eggSize/2, egg.y + eggSize/2, '#FFF8DC', 6);
          }
          return false;
        }
        
        if (egg.y > gameHeight) {
          // Missed egg
          if (egg.type !== 'rotten') {
            setLives(l => l - 1);
          }
          return false;
        }
        
        return true;
      });

      return remainingEggs;
    });

    // Update particles
    setParticles(prev => {
      return prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * 0.98,
        vy: particle.vy * 0.98,
        life: particle.life - 0.02
      })).filter(particle => particle.life > 0);
    });

    // Level progression
    if (score > 0 && score % 100 === 0) {
      const newLevel = Math.floor(score / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setEggSpawnRate(prev => Math.min(prev + 0.005, 0.08));
      }
    }
  }, [gameRunning, gameOver, spawnEgg, checkCollision, createParticles, score, level]);

  // Game loop
  useEffect(() => {
    if (!gameRunning || gameOver) return;
    
    const interval = setInterval(gameLoop, 16);
    return () => clearInterval(interval);
  }, [gameLoop, gameRunning, gameOver]);

  // Check game over
  useEffect(() => {
    if (lives <= 0) {
      setGameOver(true);
      setGameRunning(false);
    }
  }, [lives]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          setBasketColumn(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
        case 'd':
          setBasketColumn(prev => Math.min(numColumns - 1, prev + 1));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, numColumns]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setEggs([]);
    setParticles([]);
    setGameOver(false);
    setGameRunning(true);
    setEggSpawnRate(0.02);
    setBasketColumn(2);
  };

  const resetGame = () => {
    setGameRunning(false);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setLevel(1);
    setEggs([]);
    setParticles([]);
    setEggSpawnRate(0.02);
    setBasketColumn(2);
  };

  const getEggEmoji = (type: string) => {
    switch (type) {
      case 'golden': return '🥚';
      case 'rotten': return '🥚';
      case 'normal': return '🥚';
      default: return '🥚';
    }
  };

  const getEggColor = (type: string) => {
    switch (type) {
      case 'golden': return '#FFD700';
      case 'rotten': return '#8B4513';
      case 'normal': return '#FFF8DC';
      default: return '#FFF8DC';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6 max-w-4xl w-full relative">
        <Link href="/dashboard" passHref>
          <Button variant="ghost" className="absolute top-6 left-6 text-white hover:bg-gray-700 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-center mb-6 text-white pt-8 md:pt-0">
          🥚 <span className="text-pink-400">Egg Catcher</span> Game 🧺
        </h1>
        
        <div className="flex justify-center gap-8 mb-4">
          <div className="text-xl font-semibold text-pink-400">Score: {score}</div>
          <div className="text-xl font-semibold text-pink-300">Lives: {lives}</div>
          <div className="text-xl font-semibold text-pink-500">Level: {level}</div>
        </div>

        <div 
          id="game-container"
          className="relative mx-auto border-4 border-pink-400 rounded-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900"
          style={{ width: gameWidth, height: gameHeight }}
        >
          {/* Game elements */}
          {gameRunning && (
            <>
              {/* Eggs */}
              {eggs.map(egg => (
                <div
                  key={egg.id}
                  className="absolute text-2xl transition-all duration-75"
                  style={{
                    left: egg.x,
                    top: egg.y,
                    color: getEggColor(egg.type),
                    filter: egg.type === 'golden' ? 'drop-shadow(0 0 8px #FFD700)' : 
                           egg.type === 'rotten' ? 'drop-shadow(0 0 4px #8B4513)' : 'none'
                  }}
                >
                  {getEggEmoji(egg.type)}
                </div>
              ))}

              {/* Particles */}
              {particles.map(particle => (
                <div
                  key={particle.id}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: particle.x,
                    top: particle.y,
                    backgroundColor: particle.color,
                    opacity: particle.life
                  }}
                />
              ))}

              {/* Basket */}
              <div
                className="absolute bottom-5 text-4xl transition-all duration-75"
                style={{ // The basket's x position is now calculated from its column
                  left: basketX - basketWidth / 2,
                  width: basketWidth,
                  textAlign: 'center'
                }}
              >
                🧺
              </div>
            </>
          )}

          {/* Game states */}
          {!gameRunning && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-4 text-pink-400">🥚 Egg Catcher 🧺</h2>
                <p className="text-lg mb-6 text-gray-300">
                  Catch the falling eggs with your basket!<br/>
                  🥚 Normal eggs: <span className="text-pink-300">+10 points</span><br/>
                  🥚 Golden eggs: <span className="text-pink-400">+50 points</span><br/>
                  🥚 Rotten eggs: <span className="text-pink-200">-1 life</span><br/>
                  Use arrow keys (or A/D) to move
                </p>
                <button
                  onClick={startGame}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors border border-pink-400"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-4 text-pink-400">Game Over!</h2>
                <p className="text-xl mb-2 text-pink-300">Final Score: {score}</p>
                <p className="text-lg mb-6 text-gray-300">Level Reached: {level}</p>
                <div className="space-x-4">
                  <button
                    onClick={startGame}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors border border-pink-400"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={resetGame}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors border border-gray-400"
                  >
                    Main Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-gray-400">
          <p className="text-sm">
            🎮 Controls: Arrow Keys (A/D) • 
            Avoid rotten eggs! • 
            Catch golden eggs for bonus points!
          </p>
        </div>
      </div>
    </div>
  );
};

export default EggCatcherGame;