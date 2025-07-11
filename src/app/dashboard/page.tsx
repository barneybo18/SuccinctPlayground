"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
// import { Chat } from "@/components/chat";
import { quizList } from "@/lib/quiz-data";

// Mock data for the learning games
const gameModules = [
  {
    title: "Maze Generator and Solver",
    description:
      "Watch algorithms create and solve mazes in real-time. A fun way to visualize pathfinding concepts.",
    href: "/games/maze",
  },
  {
    title: "ZK Physics Playground",
    description:
      "Experiment with physics concepts like gravity and collisions in a virtual sandbox.",
    href: "/games/physics",
  },
  {
    title: "Egg Catcher's Challenge",
    description:
      "Catch falling eggs while avoiding obstacles. I just included this because of Advaith's love for eggs.",
    href: "/games/eggCatcher",
  },
  {
    title: "The Succinct Team Quiz",
    description:
      "Prove your knowledge about the Succinct team and their contributions to ZK.",
    href: "/games/succinctTeam",
  },
  {
    title: "Succinct EGG 3D-dash",
    description:
      "Also an Inspiration from Adavaith's love for eggs. 😁",
    href: "/games/threeDEgg",
  }, 
  {
    title: "Fried Sweeper",
    description:
      "avoid the mines and collect fried eggs in this fun twist on the classic game.",
    href: "/games/friedSweeper",
  },
//   {
//     title: "ZK Pacman",
//     description:
//       "Navigate the maze, collect tokens, and avoid ghosts in this ZK-powered version of Pacman.",
//     href: "/games/zkPac",
//   },
];

export default function DashboardPage() {
  const { user } = useUser();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <motion.div
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            variants={itemVariants}
          >
            Welcome back, <span className="text-pink-500">{user?.firstName || "Explorer"}</span>!
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground mb-8"
            variants={itemVariants}
          >
            Continue your journey into the world of Zero-Knowledge Proofs.
          </motion.p>

          <motion.h2
            className="text-2xl md:text-3xl font-bold tracking-tight mb-4"
            variants={itemVariants}
          >
            Interactive Games
          </motion.h2>
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12"
            variants={containerVariants}
          >
            {gameModules.map((module) => (
              <motion.div key={module.title} variants={itemVariants}>
                <Card className="h-full flex flex-col hover:border-pink-400/60 transition-colors">
                  <CardHeader>
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow"></CardContent>
                  <CardFooter className="flex justify-end items-center">
                    <Button
                      asChild
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      <Link href={module.href}>Start Game</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.h2
            className="text-2xl md:text-3xl font-bold tracking-tight mb-4"
            variants={itemVariants}
          >
            Knowledge Quizzes
          </motion.h2>
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
          >
            {quizList.map((module) => (
              <motion.div key={module.title} variants={itemVariants}>
                <Card className="h-full flex flex-col hover:border-pink-400/60 transition-colors">
                  <CardHeader>
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow"></CardContent>
                  <CardFooter className="flex justify-end items-center">
                    <Button 
                      asChild 
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      <Link href={`/games/${module.id}`}>Start Quiz</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}