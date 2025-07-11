"use client";

import { Header } from "@/components/header";
import { motion, Variants } from "framer-motion";
import {
  Button
} from "@/components/ui/button";

import {
  Sparkles,
  Lightbulb,
  BrainCircuit,
  BookOpen,
  PencilRuler,
  Zap,
  Rocket,
  Atom,
  Compass,
  Target,
  Star,
  Heart,
  Palette,
  Cpu,
  Database,
  Code,
  Globe,
  Shield,
  Key,
  Lock,
  Eye,
  Microscope,
  Layers,
  GitBranch,
  Network,
  Puzzle,
  Beaker,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";

const backgroundIcons = [
  // Core ZK/Succinct icons
  { icon: Shield, category: "zk", weight: 3 },
  { icon: Key, category: "zk", weight: 3 },
  { icon: Lock, category: "zk", weight: 3 },
  { icon: Eye, category: "zk", weight: 2 },
  { icon: Layers, category: "zk", weight: 2 },
  { icon: Network, category: "zk", weight: 2 },
  
  // Innovation & Tech
  { icon: Rocket, category: "innovation", weight: 3 },
  { icon: Atom, category: "innovation", weight: 2 },
  { icon: Cpu, category: "innovation", weight: 2 },
  { icon: Database, category: "innovation", weight: 2 },
  { icon: Code, category: "innovation", weight: 2 },
  { icon: GitBranch, category: "innovation", weight: 1 },
  { icon: Globe, category: "innovation", weight: 1 },
  
  // Education & Learning
  { icon: BookOpen, category: "education", weight: 3 },
  { icon: Lightbulb, category: "education", weight: 3 },
  { icon: BrainCircuit, category: "education", weight: 2 },
  { icon: Microscope, category: "education", weight: 2 },
  { icon: Puzzle, category: "education", weight: 2 },
  { icon: Beaker, category: "education", weight: 1 },
  { icon: Compass, category: "education", weight: 1 },
  
  // Creativity & Design
  { icon: Palette, category: "creativity", weight: 2 },
  { icon: PencilRuler, category: "creativity", weight: 2 },
  { icon: Sparkles, category: "creativity", weight: 3 },
  { icon: Star, category: "creativity", weight: 2 },
  { icon: Heart, category: "creativity", weight: 1 },
  { icon: Zap, category: "creativity", weight: 2 },
  { icon: Target, category: "creativity", weight: 1 },
];

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [hasMounted, setHasMounted] = useState(false);
  
  const FADE_IN_ANIMATION_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", duration: 0.6 },
    },
  };

  // Generate stable random values for icons
  const iconConfigs = useMemo(() => {
    return Array.from({ length: 35 }).map((_, idx) => {
      const iconData = backgroundIcons[idx % backgroundIcons.length];
      return {
        iconData,
        baseX: Math.random() * 100,
        baseY: Math.random() * 100,
        size: Math.random() * 1.5 + 1.2,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10,
        scaleDuration: 8 + Math.random() * 4,
        rotateDuration: 25 + Math.random() * 15,
        initialRotate: Math.random() * 360,
      };
    });
  }, []);

  // Spark particle canvas setup
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: { x: number; y: number; radius: number; dx: number; dy: number }[] = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + 0.3,
        dx: (Math.random() - 0.5) * 0.2,
        dy: (Math.random() - 0.5) * 0.2,
      });
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 192, 203, 0.08)";
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;

        // wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      });
      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  useEffect(() => {
    setHasMounted(true);

    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", updateWindowSize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Calculate distance-based brightness for hover effect
  const calculateBrightness = (iconX: number, iconY: number) => {
    if (!hasMounted || windowSize.width === 0 || windowSize.height === 0) {
      return 0.1; // Default opacity
    }

    // Convert percentage position to pixel position
    const pixelX = (iconX / 100) * windowSize.width;
    const pixelY = (iconY / 100) * windowSize.height;
    
    // Calculate distance from cursor
    const dx = mousePosition.x - pixelX;
    const dy = mousePosition.y - pixelY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Define hover radius (150px) and max brightness
    const hoverRadius = 150;
    const maxBrightness = 0.5; // Brighter when close
    const baseBrightness = 0.1; // Base opacity for faint visibility
    
    if (distance <= hoverRadius) {
      // Calculate brightness based on distance (closer = brighter)
      const proximity = 1 - (distance / hoverRadius);
      return baseBrightness + (maxBrightness * proximity);
    }
    
    return baseBrightness;
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background overflow-hidden">
      {/* Spark Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Enhanced Floating Icons Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
        {hasMounted && iconConfigs.map((config, idx) => {
          const Icon = config.iconData.icon;
          const currentBrightness = calculateBrightness(config.baseX, config.baseY);

          return (
            <motion.div
              key={idx}
              className="absolute"
              style={{
                left: `${config.baseX}%`,
                top: `${config.baseY}%`,
                fontSize: `${config.size}rem`,
                transform: 'translate(-50%, -50%)',
                color: 'var(--accent-foreground)', // Use a themed pink color
              }}
              initial={{
                opacity: 0.2,
                scale: 0.8,
                rotate: config.initialRotate,
              }}
              animate={{
                opacity: currentBrightness,
                scale: [0.8, 1.1, 0.9, 1],
                rotate: [config.initialRotate, config.initialRotate + 360],
              }}
              transition={{
                duration: config.duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
                delay: config.delay,
                scale: {
                  duration: config.scaleDuration,
                  repeat: Infinity,
                  repeatType: "reverse",
                },
                rotate: {
                  duration: config.rotateDuration,
                  repeat: Infinity,
                  ease: "linear",
                },
                opacity: {
                  duration: 0.3,
                  ease: "easeOut",
                },
              }}
            >
              <Icon />
            </motion.div>
          );
        })}
      </div>

      {/* Pulsing Orbs for Extra Ambiance */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {hasMounted && Array.from({ length: 8 }).map((_, idx) => (
          <motion.div
            key={`orb-${idx}`}
            className="absolute rounded-full bg-gradient-to-r from-pink-300/10 via-purple-300/10 to-blue-300/10 blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.3, 0],
              scale: [0.5, 1.2, 0.8],
              x: [0, Math.random() * 50 - 25, 0],
              y: [0, Math.random() * 50 - 25, 0],
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-4 min-h-screen">
          <motion.div
            initial="hidden"
            animate="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="max-w-3xl flex flex-col items-center space-y-6"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-white to-purple-400"
              variants={FADE_IN_ANIMATION_VARIANTS}
            >
              Succinct Playground
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground"
              variants={FADE_IN_ANIMATION_VARIANTS}
            >
              An interactive educational platform where you can visualize how
              zero-knowledge proofs work. Think of it as
              <span className="text-pink-400 font-medium"> ZK proofs explained through games</span>.
            </motion.p>

            <motion.div variants={FADE_IN_ANIMATION_VARIANTS}>
              <Button
                size="lg"
                asChild
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-pink-500/40 transform hover:-translate-y-1"
              >
                <Link href="/dashboard">
                  Explore the Playground
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={FADE_IN_ANIMATION_VARIANTS}
              className="flex items-center space-x-2 text-sm text-muted-foreground mt-4"
            >
              <Sparkles className="text-pink-400 animate-bounce" size={16} />
              <span>Built for the Succinct community by the @oboh_banny18</span>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}