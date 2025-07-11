"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PhysicsPlayground() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const mouseRef = useRef<Matter.Mouse | null>(null);
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  
  const [bodies, setBodies] = useState<Matter.Body[]>([]);
  const [gravity, setGravity] = useState(1);
  const [isMouseEnabled, setIsMouseEnabled] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string>('box');
  const [isPaused, setIsPaused] = useState(false);
 

  useEffect(() => {
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint,
      Events = Matter.Events;

    const engine = Engine.create();
    const scene = sceneRef.current!;
    engineRef.current = engine;

    const render = Render.create({
      element: scene,
      engine,
      options: {
        width: 900,
        height: 600,
        wireframes: false,
        background: "transparent",
        showAngleIndicator: false,
        showVelocity: false,
      },
    });

    renderRef.current = render;

    // Create boundaries
    const walls = [
      Bodies.rectangle(450, 590, 900, 20, { isStatic: true, render: { fillStyle: "#ffffff" } }), // ground
      Bodies.rectangle(450, 10, 900, 20, { isStatic: true, render: { fillStyle: "#ffffff" } }), // ceiling
      Bodies.rectangle(10, 300, 20, 600, { isStatic: true, render: { fillStyle: "#ffffff" } }), // left wall
      Bodies.rectangle(890, 300, 20, 600, { isStatic: true, render: { fillStyle: "#ffffff" } }), // right wall
    ];

    Composite.add(engine.world, walls);

    // Mouse control
    const mouse = Mouse.create(render.canvas);
    mouseRef.current = mouse;
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });
    mouseConstraintRef.current = mouseConstraint;

    Composite.add(engine.world, mouseConstraint);

    // Click to add objects
    Events.on(mouseConstraint, 'mousedown', function(event) {
      if (mouseConstraint.body) return; // Don't add if dragging an object
      
      const mousePos = event.mouse.position;
      addObjectAtPosition(mousePos.x, mousePos.y);
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  // Update gravity when changed
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.world.gravity.y = gravity;
    }
  }, [gravity]);

  // Toggle mouse interaction
  useEffect(() => {
    if (mouseConstraintRef.current) {
      mouseConstraintRef.current.constraint.stiffness = isMouseEnabled ? 0.2 : 0;
    }
  }, [isMouseEnabled]);

  // Pause/unpause physics
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.timing.timeScale = isPaused ? 0 : 1;
    }
  }, [isPaused]);

  const addObjectAtPosition = (x: number, y: number) => {
    const Bodies = Matter.Bodies;

    let body;
    const colors = ['#00e0ff', '#ffaa00', '#ff007f', '#00ff88', '#ff4444', '#8844ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    switch (selectedTool) {
      case 'box':
        const size = Math.random() * 40 + 20;
        body = Bodies.rectangle(x, y, size, size, {
          render: { fillStyle: color },
          restitution: 0.3,
          friction: 0.001,
          frictionAir: 0.01,
        });
        break;
      case 'ball':
        const radius = Math.random() * 25 + 15;
        body = Bodies.circle(x, y, radius, {
          render: { fillStyle: color },
          restitution: 0.8,
          friction: 0.001,
          frictionAir: 0.01,
        });
        break;
      case 'triangle':
        const triSize = Math.random() * 30 + 20;
        body = Bodies.polygon(x, y, 3, triSize, {
          render: { fillStyle: color },
          restitution: 0.4,
          friction: 0.001,
          frictionAir: 0.01,
        });
        break;
      case 'hexagon':
        const hexSize = Math.random() * 25 + 15;
        body = Bodies.polygon(x, y, 6, hexSize, {
          render: { fillStyle: color },
          restitution: 0.5,
          friction: 0.001,
          frictionAir: 0.01,
        });
        break;
      case 'platform':
        body = Bodies.rectangle(x, y, 120, 15, {
          isStatic: true,
          render: { fillStyle: '#ffffff' },
        });
        break;
      default:
        return;
    }

    Matter.Composite.add(engineRef.current!.world, body);
    setBodies((prev) => [...prev, body]);
  };

  const addRandomObjects = () => {
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 700 + 100;
      const y = Math.random() * 200 + 50;
      addObjectAtPosition(x, y);
    }
  };

  const clearAll = () => {
    if (engineRef.current) {
      // Remove all bodies except walls
      const bodiesToRemove = bodies.filter(body => !body.isStatic || body.render.fillStyle !== '#ffffff');
      Matter.Composite.remove(engineRef.current.world, bodiesToRemove);
      setBodies([]);
    }
  };

  const explode = () => {
    bodies.forEach(body => {
      if (!body.isStatic) {
        const forceMagnitude = 0.02;
        const angle = Math.random() * Math.PI * 2;
        Matter.Body.applyForce(body, body.position, {
          x: Math.cos(angle) * forceMagnitude,
          y: Math.sin(angle) * forceMagnitude
        });
      }
    });
  };

  const toggleGravity = () => {
    setGravity(prev => prev === 0 ? 1 : 0);
  };

  const reverseGravity = () => {
    setGravity(prev => -prev);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white flex flex-col items-center justify-center p-6">
      <Link href="/dashboard" passHref>
        <Button variant="ghost" className="absolute top-6 left-6 text-white hover:bg-white/20 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 pt-12 md:pt-0">
        Physics Playground
      </h1>
      <p className="mb-6 text-gray-300">Click anywhere to add objects • Drag to move them around</p>

      {/* Tool Selection */}
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        {[
          { id: 'box', label: 'Box', color: 'bg-cyan-500' },
          { id: 'ball', label: 'Ball', color: 'bg-orange-500' },
          { id: 'triangle', label: 'Triangle', color: 'bg-pink-500' },
          { id: 'hexagon', label: 'Hexagon', color: 'bg-green-500' },
          { id: 'platform', label: 'Platform', color: 'bg-white' }
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedTool === tool.id 
                ? `${tool.color} text-black scale-105 shadow-lg` 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-4 flex-wrap justify-center">
        <button 
          onClick={addRandomObjects}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform"
        >
          Add Random (10)
        </button>
        <button 
          onClick={explode}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform"
        >
          💥 Explode
        </button>
        <button 
          onClick={clearAll}
          className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform"
        >
          Clear All
        </button>
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className={`px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform ${
            isPaused ? 'bg-green-600' : 'bg-yellow-600'
          }`}
        >
          {isPaused ? '▶ Play' : '⏸ Pause'}
        </button>
      </div>

      {/* Physics Controls */}
      <div className="flex gap-3 mb-4 flex-wrap justify-center items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Gravity:</label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-20"
          />
          <span className="text-sm w-8">{gravity.toFixed(1)}</span>
        </div>
        <button 
          onClick={toggleGravity}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium"
        >
          {gravity === 0 ? 'Enable' : 'Disable'} Gravity
        </button>
        <button 
          onClick={reverseGravity}
          className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-sm font-medium"
        >
          Reverse Gravity
        </button>
        <button 
          onClick={() => setIsMouseEnabled(!isMouseEnabled)}
          className={`px-3 py-1 rounded text-sm font-medium ${
            isMouseEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Mouse: {isMouseEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-400 mb-4">
        Objects: {bodies.length} | Selected: {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}
      </div>

      {/* Physics Canvas */}
      <div 
        ref={sceneRef} 
        className="border-2 border-white/20 rounded-xl shadow-2xl backdrop-blur-sm bg-black/20"
        style={{ cursor: selectedTool === 'platform' ? 'crosshair' : 'pointer' }}
      />

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-gray-400 max-w-2xl">
        <p><strong>Controls:</strong> Click to add objects • Drag to move • Use sliders to adjust physics</p>
        <p>Try different combinations of gravity settings and object types for interesting effects!</p>
      </div>
    </main>
  );
}