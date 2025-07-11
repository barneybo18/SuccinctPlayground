"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Egg {
  name: string;
  color: number;
  description: string;
}

interface GameMap {
  name: string;
  backgroundColor: number;
  pathColor: number;
  obstacleTypes: string[];
  theme: string;
  description: string;
}

const eggs: Egg[] = [
  { name: 'Classic', color: 0xffeaa7, description: 'The timeless choice 🥚' },
  { name: 'Golden', color: 0xffd700, description: 'Shimmering luxury' },
  { name: 'Emerald', color: 0x50c878, description: 'Nature\'s gem' },
  { name: 'Ruby', color: 0xe0115f, description: 'Fiery passion' },
  { name: 'Sapphire', color: 0x0f52ba, description: 'Ocean depths' },
  { name: 'Cosmic', color: 0x663399, description: 'Starlight magic' },
];

const maps: GameMap[] = [
  { 
    name: 'Kitchen Chaos', 
    backgroundColor: 0x87ceeb, 
    pathColor: 0xf5deb3,
    obstacleTypes: ['hammer', 'fryingPan', 'rollingPin'],
    theme: 'kitchen',
    description: 'Navigate through flying cookware'
  },
  { 
    name: 'Farm Frenzy', 
    backgroundColor: 0x98fb98, 
    pathColor: 0x8b7355,
    obstacleTypes: ['pitchfork', 'bucket', 'shovel'],
    theme: 'farm',
    description: 'Dodge the farming tools'
  },
  { 
    name: 'Space Odyssey', 
    backgroundColor: 0x191970, 
    pathColor: 0x2f4f4f,
    obstacleTypes: ['asteroid', 'satellite', 'rocket'],
    theme: 'space',
    description: 'Journey through the cosmos'
  },
  { 
    name: 'Candy Land', 
    backgroundColor: 0xffb6c1, 
    pathColor: 0xffefd5,
    obstacleTypes: ['lollipop', 'gummy', 'cookie'],
    theme: 'candy',
    description: 'Sweet obstacles await'
  },
];

const EggBounceGame: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedEgg, setSelectedEgg] = useState<Egg>(eggs[0]);
  const [selectedMap, setSelectedMap] = useState<GameMap>(maps[0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const gameStateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    egg: null as THREE.Mesh | null,
    path: null as THREE.Mesh | null,
    leftBorder: null as THREE.Mesh | null,
    rightBorder: null as THREE.Mesh | null,
    obstacles: [] as THREE.Mesh[],
    scenery: [] as THREE.Mesh[],
    eggVelocity: new THREE.Vector3(0, 0, -0.1),
    eggPosition: new THREE.Vector3(0, 0.5, 0),
    keys: {} as { [key: string]: boolean },
    touches: {} as { [key: string]: boolean },
    animationId: null as number | null,
    lastObstacleSpawn: 0,
    lastFrameTime: performance.now(),
    gameRunning: false,
    isJumping: false,
    frameCount: 0,
    cameraTarget: new THREE.Vector3(0, 4, 6),
    smoothCameraPosition: new THREE.Vector3(0, 4, 6),
  });

  const createObstacleGeometry = (type: string): THREE.BufferGeometry => {
    const geometries: { [key: string]: THREE.BufferGeometry } = {
      hammer: new THREE.BoxGeometry(0.4, 0.6, 0.2),
      fryingPan: new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12),
      rollingPin: new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12),
      pitchfork: new THREE.BoxGeometry(0.15, 0.8, 0.15),
      bucket: new THREE.CylinderGeometry(0.3, 0.25, 0.4, 12),
      shovel: new THREE.BoxGeometry(0.25, 0.6, 0.12),
      asteroid: new THREE.SphereGeometry(0.4, 8, 8),
      satellite: new THREE.BoxGeometry(0.4, 0.25, 0.4),
      rocket: new THREE.ConeGeometry(0.15, 0.7, 8),
      lollipop: new THREE.SphereGeometry(0.25, 12, 12),
      gummy: new THREE.BoxGeometry(0.25, 0.25, 0.25),
      cookie: new THREE.CylinderGeometry(0.25, 0.25, 0.08, 12),
    };
    return geometries[type] || new THREE.BoxGeometry(0.3, 0.3, 0.3);
  };

  const createScenery = useCallback((scene: THREE.Scene, mapTheme: string) => {
    const sceneryObjects: THREE.Mesh[] = [];
    
    for (let i = 0; i < 20; i++) {
      let geometry: THREE.BufferGeometry;
      let material: THREE.MeshLambertMaterial;
      
      switch (mapTheme) {
        case 'kitchen':
          geometry = new THREE.BoxGeometry(1, 2, 0.5);
          material = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
          break;
        case 'farm':
          geometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
          material = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
          break;
        case 'space':
          geometry = new THREE.SphereGeometry(0.5, 8, 8);
          material = new THREE.MeshLambertMaterial({ color: 0x696969 });
          break;
        case 'candy':
          geometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
          material = new THREE.MeshLambertMaterial({ color: 0xff69b4 });
          break;
        default:
          geometry = new THREE.BoxGeometry(0.5, 1, 0.5);
          material = new THREE.MeshLambertMaterial({ color: 0x808080 });
      }
      
      const sceneryObj = new THREE.Mesh(geometry, material);
      sceneryObj.position.set(
        (Math.random() - 0.5) * 20,
        geometry instanceof THREE.CylinderGeometry ? 1 : 0.5,
        -i * 16 - 20
      );
      sceneryObj.castShadow = true;
      sceneryObj.receiveShadow = true;
      scene.add(sceneryObj);
      sceneryObjects.push(sceneryObj);
    }
    
    for (let i = 0; i < 10; i++) {
      let floatingGeometry: THREE.BufferGeometry;
      let floatingMaterial: THREE.MeshLambertMaterial;
      
      switch (mapTheme) {
        case 'space':
          floatingGeometry = new THREE.SphereGeometry(0.1, 6, 6);
          floatingMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
          break;
        case 'candy':
          floatingGeometry = new THREE.SphereGeometry(0.05, 8, 8);
          floatingMaterial = new THREE.MeshLambertMaterial({ color: 0xffb6c1 });
          break;
        default:
          continue;
      }
      
      const floatingObj = new THREE.Mesh(floatingGeometry, floatingMaterial);
      floatingObj.position.set(
        (Math.random() - 0.5) * 15,
        Math.random() * 5 + 2,
        -Math.random() * 100 - 20
      );
      scene.add(floatingObj);
      sceneryObjects.push(floatingObj);
    }
    
    return sceneryObjects;
  }, []);

  const createEggBreakEffect = useCallback((position: THREE.Vector3, color: number) => {
    const particles: THREE.Mesh[] = [];
    const particleGeometry = new THREE.SphereGeometry(0.02, 6, 6);
    
    for (let i = 0; i < 25; i++) {
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.copy(position);
      particle.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      ));
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.12,
        Math.random() * 0.08 + 0.03,
        (Math.random() - 0.5) * 0.12
      );
      
      particle.userData = { velocity, life: 60 };
      particles.push(particle);
      gameStateRef.current.scene?.add(particle);
    }
    
    const animateParticles = () => {
      particles.forEach((particle, index) => {
        if (particle.userData.life > 0) {
          particle.position.add(particle.userData.velocity);
          particle.userData.velocity.y -= 0.003;
          particle.userData.life--;
          
          if (particle.userData.life <= 0) {
            gameStateRef.current.scene?.remove(particle);
            particles.splice(index, 1);
          }
        }
      });
      
      if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
      }
    };
    
    animateParticles();
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setGameSpeed(1);
    
    if (gameStateRef.current.egg) {
      gameStateRef.current.eggPosition.set(0, 0.5, 0);
      gameStateRef.current.eggVelocity.set(0, 0, -0.1);
      gameStateRef.current.egg.position.copy(gameStateRef.current.eggPosition);
      gameStateRef.current.isJumping = false;
    }
    
    // Clean up obstacles properly
    gameStateRef.current.obstacles.forEach(obstacle => {
      if (gameStateRef.current.scene) {
        gameStateRef.current.scene.remove(obstacle);
        obstacle.geometry.dispose();
        if (obstacle.material instanceof THREE.Material) {
          obstacle.material.dispose();
        }
      }
    });
    gameStateRef.current.obstacles = [];
    gameStateRef.current.lastObstacleSpawn = 0;
    gameStateRef.current.frameCount = 0;
    gameStateRef.current.gameRunning = true;
    
    // Reset camera smoothly
    gameStateRef.current.cameraTarget.set(0, 4, 6);
    gameStateRef.current.smoothCameraPosition.set(0, 4, 6);
  }, []);

  const initializeGame = useCallback(() => {
    if (!mountRef.current) return;

    // Clean up previous game
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(selectedMap.backgroundColor);
    scene.fog = new THREE.Fog(selectedMap.backgroundColor, 8, 30);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    const pathGeometry = new THREE.PlaneGeometry(5, 400);
    const pathMaterial = new THREE.MeshLambertMaterial({ 
      color: selectedMap.pathColor,
      transparent: true,
      opacity: 0.9
    });
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    path.rotation.x = -Math.PI / 2;
    path.position.y = -0.1;
    path.position.z = -100;
    path.receiveShadow = true;
    scene.add(path);

    const borderGeometry = new THREE.BoxGeometry(0.2, 0.2, 400);
    const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    
    const leftBorder = new THREE.Mesh(borderGeometry, borderMaterial);
    leftBorder.position.set(-2.6, 0, -100);
    leftBorder.castShadow = true;
    scene.add(leftBorder);
    
    const rightBorder = new THREE.Mesh(borderGeometry, borderMaterial);
    rightBorder.position.set(2.6, 0, -100);
    rightBorder.castShadow = true;
    scene.add(rightBorder);

    const eggGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    eggGeometry.scale(1, 1.4, 1);
    const eggMaterial = new THREE.MeshPhongMaterial({ 
      color: selectedEgg.color,
      shininess: 80,
      specular: 0xffffff
    });
    const egg = new THREE.Mesh(eggGeometry, eggMaterial);
    egg.position.set(0, 0.5, 0);
    egg.castShadow = true;
    scene.add(egg);

    const sceneryObjects = createScenery(scene, selectedMap.theme);

    camera.position.set(0, 4, 6);
    camera.lookAt(0, 0, 0);

    gameStateRef.current = {
      scene,
      camera,
      renderer,
      egg,
      path,
      leftBorder,
      rightBorder,
      obstacles: [],
      scenery: sceneryObjects,
      eggVelocity: new THREE.Vector3(0, 0, -0.1),
      eggPosition: new THREE.Vector3(0, 0.5, 0),
      keys: {},
      touches: {},
      animationId: null,
      lastObstacleSpawn: 0,
      lastFrameTime: performance.now(),
      gameRunning: true,
      isJumping: false,
      frameCount: 0,
      cameraTarget: new THREE.Vector3(0, 4, 6),
      smoothCameraPosition: new THREE.Vector3(0, 4, 6),
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      gameStateRef.current.keys[event.code] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      gameStateRef.current.keys[event.code] = false;
    };

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const touches = event.touches;
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Define touch zones
        if (touchX < windowWidth * 0.33) {
          gameStateRef.current.touches['left'] = true;
        } else if (touchX > windowWidth * 0.66) {
          gameStateRef.current.touches['right'] = true;
        }
        if (touchY > windowHeight * 0.66) {
          gameStateRef.current.touches['jump'] = true;
        }
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      const touches = event.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (touchX < windowWidth * 0.33) {
          gameStateRef.current.touches['left'] = false;
        } else if (touchX > windowWidth * 0.66) {
          gameStateRef.current.touches['right'] = false;
        }
        if (touchY > windowHeight * 0.66) {
          gameStateRef.current.touches['jump'] = false;
        }
      }
    };

    const handleResize = () => {
      if (gameStateRef.current.camera && gameStateRef.current.renderer) {
        gameStateRef.current.camera.aspect = window.innerWidth / window.innerHeight;
        gameStateRef.current.camera.updateProjectionMatrix();
        gameStateRef.current.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (!gameStateRef.current.gameRunning) return;

      const now = performance.now();
      const deltaTime = Math.min((now - gameStateRef.current.lastFrameTime) / 1000, 0.033);
      gameStateRef.current.lastFrameTime = now;

      gameStateRef.current.animationId = requestAnimationFrame(animate);
      gameStateRef.current.frameCount++;

      const { 
        egg, 
        camera, 
        renderer, 
        scene, 
        path, 
        leftBorder, 
        rightBorder, 
        obstacles, 
        keys, 
        touches,
        eggVelocity, 
        eggPosition,
        cameraTarget,
        smoothCameraPosition
      } = gameStateRef.current;
      
      if (!egg || !camera || !renderer || !scene || !path || !leftBorder || !rightBorder) return;

      const gravity = -0.012;
      const friction = 0.96;
      const lateralSpeed = 0.08;
      const jumpForce = 0.18;
      const groundLevel = 0.3;
      const forwardSpeed = -0.1;

      // Handle input (keyboard and touch)
      if (keys['ArrowLeft'] || keys['KeyA'] || touches['left']) {
        eggVelocity.x -= lateralSpeed * deltaTime * 60;
      }
      if (keys['ArrowRight'] || keys['KeyD'] || touches['right']) {
        eggVelocity.x += lateralSpeed * deltaTime * 60;
      }
      if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || touches['jump']) && eggPosition.y <= groundLevel + 0.1) {
        eggVelocity.y = jumpForce;
        gameStateRef.current.isJumping = true;
      }

      // Apply physics
      eggVelocity.y += gravity * deltaTime * 60;
      eggVelocity.x *= Math.pow(friction, deltaTime * 60);
      eggVelocity.z = forwardSpeed;

      eggPosition.add(eggVelocity.clone().multiplyScalar(deltaTime * 60));

      // Ground collision
      if (eggPosition.y <= groundLevel) {
        eggPosition.y = groundLevel;
        if (eggVelocity.y < 0) {
          eggVelocity.y = Math.abs(eggVelocity.y) * 0.6;
          gameStateRef.current.isJumping = false;
        }
      }

      // Boundary constraints
      eggPosition.x = Math.max(-2.2, Math.min(2.2, eggPosition.x));

      // Update egg position and rotation
      egg.position.copy(eggPosition);
      egg.rotation.x += eggVelocity.y * 0.1;
      egg.rotation.z += eggVelocity.x * 0.05;

      // Smooth camera following
      cameraTarget.set(
        eggPosition.x * 0.3,
        eggPosition.y + 4,
        eggPosition.z + 8
      );
      
      // Smooth camera interpolation
      smoothCameraPosition.lerp(cameraTarget, 0.08);
      camera.position.copy(smoothCameraPosition);
      camera.lookAt(eggPosition.x, eggPosition.y + 0.5, eggPosition.z);

      // Spawn obstacles with better timing
      if (gameStateRef.current.frameCount % Math.max(90 - Math.floor(gameSpeed * 10), 30) === 0) {
        if (Math.random() < 0.6) {
          const obstacleType = selectedMap.obstacleTypes[Math.floor(Math.random() * selectedMap.obstacleTypes.length)];
          const obstacleGeometry = createObstacleGeometry(obstacleType);
          const obstacleMaterial = new THREE.MeshLambertMaterial({ 
            color: Math.random() * 0xffffff
          });
          const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
          
          obstacle.position.set(
            (Math.random() - 0.5) * 3.5,
            groundLevel + 0.2,
            eggPosition.z - 25
          );
          obstacle.castShadow = true;
          obstacle.userData = { 
            type: obstacleType,
            hasBeenPassed: false,
            fadeOut: false,
            opacity: 1
          };
          scene.add(obstacle);
          obstacles.push(obstacle);
        }
      }

      // Update obstacles with smoother removal
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.position.z += 0.12 * gameSpeed * deltaTime * 60;
        obstacle.rotation.x += 0.02 * deltaTime * 60;
        obstacle.rotation.y += 0.03 * deltaTime * 60;

        // Collision detection
        const distance = egg.position.distanceTo(obstacle.position);
        if (distance < 0.7) {
          gameStateRef.current.gameRunning = false;
          setGameOver(true);
          setHighScore(prev => Math.max(prev, score));
          createEggBreakEffect(egg.position, selectedEgg.color);
          return;
        }

        // Check if obstacle has been passed
        if (!obstacle.userData.hasBeenPassed && obstacle.position.z > eggPosition.z + 2) {
          obstacle.userData.hasBeenPassed = true;
          setScore(prev => prev + 10);
          setGameSpeed(prev => Math.min(prev + 0.015, 2.5));
        }

        // Remove obstacles that are far behind
        if (obstacle.position.z > eggPosition.z + 15) {
          scene.remove(obstacle);
          obstacle.geometry.dispose();
          if (obstacle.material instanceof THREE.Material) {
            obstacle.material.dispose();
          }
          obstacles.splice(i, 1);
        }
      }

      // Update scenery with smoother transitions
      gameStateRef.current.scenery.forEach(obj => {
        if (obj.position.z > eggPosition.z + 12) {
          obj.position.z -= 160;
        }
      });

      // Update path and borders with smoother transitions
      if (path.position.z > eggPosition.z + 120) {
        path.position.z -= 400;
      }
      if (leftBorder.position.z > eggPosition.z + 120) {
        leftBorder.position.z -= 400;
      }
      if (rightBorder.position.z > eggPosition.z + 120) {
        rightBorder.position.z -= 400;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      if (gameStateRef.current.animationId) {
        cancelAnimationFrame(gameStateRef.current.animationId);
      }
      
      // Clean up resources
      gameStateRef.current.obstacles.forEach(obstacle => {
        obstacle.geometry.dispose();
        if (obstacle.material instanceof THREE.Material) {
          obstacle.material.dispose();
        }
      });
      
      while (mountRef.current?.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    };
  }, [selectedEgg, selectedMap, createEggBreakEffect, createScenery]);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const cleanup = initializeGame();
      return cleanup;
    }
  }, [gameStarted, gameOver, initializeGame]);

  const startGame = () => {
    setGameStarted(true);
    resetGame();
  };

  const restartGame = () => {
    setGameOver(false);
    resetGame();
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      <Link href="/dashboard" passHref>
        <Button variant="ghost" className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 text-white hover:bg-white/20 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      {gameStarted && !gameOver && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 text-white">
          <div className="bg-black bg-opacity-50 rounded-lg p-2 sm:p-4 backdrop-blur-sm">
            <div className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Score: {score}</div>
            <div className="text-xs sm:text-sm opacity-80">High Score: {highScore}</div>
            <div className="text-xs sm:text-sm opacity-80">Speed: {gameSpeed.toFixed(1)}x</div>
          </div>
        </div>
      )}

      {gameStarted && !gameOver && (
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-10 text-white">
          <div className="bg-black bg-opacity-50 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
            <div className="text-xs opacity-80">
              {isMobile ? (
                <>
                  <div>Tap left side: Move Left</div>
                  <div>Tap right side: Move Right</div>
                  <div>Tap bottom: Jump</div>
                </>
              ) : (
                <>
                  <div>← → / A D: Move</div>
                  <div>Space / ↑ / W: Jump</div>
                </>
              )}
              <div>Jump over or dodge obstacles!</div>
            </div>
          </div>
        </div>
      )}

      {gameStarted && !gameOver && isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 w-1/3 h-full opacity-20 bg-blue-500 pointer-events-auto" />
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 bg-blue-500 pointer-events-auto" />
          <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-20 bg-green-500 pointer-events-auto" />
        </div>
      )}

      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-2xl w-full mx-2 sm:mx-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
              🥚 Egg Bounce Adventure
            </h1>
            
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-700">Choose Your Egg</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {eggs.map((egg) => (
                  <button
                    key={egg.name}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedEgg.name === egg.name 
                        ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedEgg(egg)}
                  >
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">{egg.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{egg.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-700">Select Arena</h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {maps.map((map) => (
                  <button
                    key={map.name}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedMap.name === map.name 
                        ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedMap(map)}
                  >
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">{map.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{map.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center space-x-2 sm:space-x-4">
              <button
                onClick={startGame}
                className="px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                Start Adventure
              </button>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="px-4 sm:px-8 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 text-sm sm:text-base"
              >
                {showInstructions ? 'Hide' : 'Show'} Instructions
              </button>
            </div>

            {showInstructions && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-500 rounded-lg text-gray-800">
                <h3 className="text-base sm:text-lg font-semibold mb-2">How to Play</h3>
                <p className="text-xs sm:text-sm">
                  {isMobile ? (
                    <>
                      Tap left side to move left, right side to move right, and bottom to jump.
                      Dodge or jump over obstacles to score points. The game speeds up as you score!
                    </>
                  ) : (
                    <>
                      Use arrow keys or A/D to move left and right. Press Space, Up, or W to jump over obstacles.
                      Collect points by dodging or jumping over obstacles. The game speeds up as you score more points!
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div ref={mountRef} className="w-full h-full" />

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-md w-full mx-2 sm:mx-4 text-center">
            <h2 className="text-xl sm:text-3xl font-bold text-red-600 mb-2 sm:mb-4">🥚💥 Egg Smashed!</h2>
            <div className="mb-4 sm:mb-6">
              <div className="text-lg sm:text-2xl font-semibold text-gray-800 mb-1 sm:mb-2">Final Score: {score}</div>
              {score > highScore && (
                <div className="text-green-600 font-semibold text-sm sm:text-base">🎉 New High Score! 🎉</div>
              )}
              <div className="text-gray-600 text-sm sm:text-base">Best: {highScore}</div>
            </div>
            <div className="flex justify-center space-x-2 sm:space-x-4">
              <button
                onClick={restartGame}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  setGameStarted(false);
                  setGameOver(false);
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 text-sm sm:text-base"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EggBounceGame;