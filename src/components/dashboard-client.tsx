"use client";

import { useState } from "react";
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
import { Chat } from "@/components/chat";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock data for the learning games
const gameModules = [
  {
    title: "Maze Generator and Solver",
    description:
      "Waatch algorithms create and solve mazes in real-time. A fun way to visualize ZK concepts.",
    href: "/games/maze",
  },
  {
    title: "ZK Physics Playground",
    description:
      "Experiment with physics concepts like gravity, motion, and collisions in a virtual playground.",
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
];

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  status: "Not Started" | "Completed" | "Locked";
}

interface DashboardClientProps {
  lessons: Lesson[];
}

export function DashboardClient({ lessons }: DashboardClientProps) {
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(lessons.length / itemsPerPage);
  const paginatedLessons = lessons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

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
            Your Games
          </motion.h2>
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
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
            className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4"
            variants={itemVariants}
          >
            Learning Modules & Quizzes
          </motion.h2>
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
          >
            {paginatedLessons.map((module) => (
              <motion.div key={module.id} variants={itemVariants}>
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
                      <Link href={`/learn/${module.id}`}>Start Lesson</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          {totalPages > 1 && (
            <motion.div
              className="flex items-center justify-end space-x-2 py-4"
              variants={itemVariants}
            >
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}