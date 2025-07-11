"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [isMobile, setIsMobile] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Responsive game dimensions
  const [gameWidth, setGameWidth] = useState(500);
  const [gameHeight, setGameHeight] = useState(600);
  const numColumns = 5;
  const columnWidth = gameWidth / numColumns;
  const basketWidth = Math.max(40, gameWidth * 0.1);
  const basketHeight = Math.max(32, gameWidth * 0.08);
  const eggSize = Math.max(20, gameWidth * 0.048);
  const basketX = (basketColumn + 0.5) * columnWidth;

  // Check if device is mobile and set dimensions
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        const maxWidth = Math.min(window.innerWidth - 40, 400);
        setGameWidth(maxWidth);
        setGameHeight(Math.floor(maxWidth * 1.4));
      } else {
        setGameWidth(500);
        setGameHeight(600);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  }, [basketX, basketWidth, basketHeight, gameHeight, eggSize]);

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
  }, [gameRunning, gameOver, spawnEgg, checkCollision, createParticles, score, level, gameHeight, eggSize]);

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

  // Touch controls
  const handleDirectionMove = (direction: 'left' | 'right') => {
    if (!gameRunning) return;
    
    if (direction === 'left') {
      setBasketColumn(prev => Math.max(0, prev - 1));
    } else {
      setBasketColumn(prev => Math.min(numColumns - 1, prev + 1));
    }
  };

  // Swipe detection for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !gameRunning) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const minSwipeDistance = 50;
    
    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // Swipe left
        setBasketColumn(prev => Math.max(0, prev - 1));
      } else {
        // Swipe right
        setBasketColumn(prev => Math.min(numColumns - 1, prev + 1));
      }
    }
  };

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-2 sm:p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-3 sm:p-6 max-w-4xl w-full relative">
        <Button 
          variant="ghost" 
          className="absolute top-3 left-3 sm:top-6 sm:left-6 text-white hover:bg-gray-700 hover:text-white text-xs sm:text-sm"
        >
          <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Back
        </Button>

        <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6 text-white pt-12 sm:pt-8 md:pt-0">
          🥚 <span className="text-pink-400">Egg Catcher</span> 🧺
        </h1>
        
        <div className="flex justify-center gap-4 sm:gap-8 mb-4 text-sm sm:text-xl">
          <div className="font-semibold text-pink-400">Score: {score}</div>
          <div className="font-semibold text-pink-300">Lives: {lives}</div>
          <div className="font-semibold text-pink-500">Level: {level}</div>
        </div>

        <div 
          ref={gameContainerRef}
          className="relative mx-auto border-2 sm:border-4 border-pink-400 rounded-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 select-none"
          style={{ width: gameWidth, height: gameHeight }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Game elements */}
          {gameRunning && (
            <>
              {/* Eggs */}
              {eggs.map(egg => (
                <div
                  key={egg.id}
                  className="absolute transition-all duration-75 pointer-events-none"
                  style={{
                    left: egg.x,
                    top: egg.y,
                    color: getEggColor(egg.type),
                    fontSize: `${eggSize}px`,
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
                  className="absolute w-2 h-2 rounded-full pointer-events-none"
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
                className="absolute bottom-5 transition-all duration-75 pointer-events-none"
                style={{
                  left: basketX - basketWidth / 2,
                  width: basketWidth,
                  textAlign: 'center',
                  fontSize: `${basketWidth * 0.8}px`
                }}
              >
                🧺
              </div>
            </>
          )}

          {/* Game states */}
          {!gameRunning && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center text-white px-4">
                <h2 className="text-xl sm:text-3xl font-bold mb-4 text-pink-400">🥚 Egg Catcher 🧺</h2>
                <p className="text-sm sm:text-lg mb-6 text-gray-300">
                  Catch the falling eggs with your basket!<br/>
                  🥚 Normal eggs: <span className="text-pink-300">+10 points</span><br/>
                  🥚 Golden eggs: <span className="text-pink-400">+50 points</span><br/>
                  🥚 Rotten eggs: <span className="text-pink-200">-1 life</span><br/>
                  {isMobile ? 'Swipe left/right or use buttons' : 'Use arrow keys (or A/D) to move'}
                </p>
                <button
                  onClick={startGame}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-lg sm:text-xl transition-colors border border-pink-400"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center text-white px-4">
                <h2 className="text-xl sm:text-3xl font-bold mb-4 text-pink-400">Game Over!</h2>
                <p className="text-lg sm:text-xl mb-2 text-pink-300">Final Score: {score}</p>
                <p className="text-sm sm:text-lg mb-6 text-gray-300">Level Reached: {level}</p>
                <div className="space-y-2 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
                  <button
                    onClick={startGame}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-lg sm:text-xl transition-colors border border-pink-400"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={resetGame}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-lg sm:text-xl transition-colors border border-gray-400"
                  >
                    Main Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile control buttons */}
        {isMobile && gameRunning && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => handleDirectionMove('left')}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors border border-pink-400 flex items-center active:scale-95"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => handleDirectionMove('right')}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors border border-pink-400 flex items-center active:scale-95"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}

        <div className="mt-4 sm:mt-6 text-center text-gray-400">
          <p className="text-xs sm:text-sm">
            🎮 {isMobile ? 'Swipe or tap buttons to move' : 'Controls: Arrow Keys (A/D)'} • 
            Avoid rotten eggs! • 
            Catch golden eggs for bonus points!
          </p>
        </div>
      </div>
    </div>
  );
};

export default EggCatcherGame;