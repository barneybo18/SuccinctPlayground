"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Award } from "lucide-react";
import type { Quiz } from "@/lib/quiz-data";

export function QuizModule({ title, summary, questions }: Omit<Quiz, "id" | "description">) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>Read the summary below, then test your knowledge.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p>{summary.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Time!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex}>
              <p className="font-semibold mb-2">{qIndex + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((option, oIndex) => {
                  const isSelected = selectedAnswers[qIndex] === option;
                  const isCorrect = q.answer === option;
                  
                  return (
                    <Button
                      key={oIndex}
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left h-auto py-2 whitespace-normal",
                        isSubmitted && isCorrect && "border-green-500 bg-green-500/10 hover:bg-green-500/20",
                        isSubmitted && isSelected && !isCorrect && "border-red-500 bg-red-500/10 hover:bg-red-500/20",
                        !isSubmitted && isSelected && "border-pink-500"
                      )}
                      onClick={() => handleSelectAnswer(qIndex, option)}
                      disabled={isSubmitted}
                    >
                      {isSubmitted && isCorrect && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                      {isSubmitted && isSelected && !isCorrect && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                      {option}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-6 bg-card rounded-lg border"
        >
          <Award className="mx-auto h-12 w-12 text-pink-500 mb-4" />
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          <p className="text-lg text-muted-foreground">
            You scored {score} out of {questions.length}.
          </p>
        </motion.div>
      ) : (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length !== questions.length}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            Submit Answers
          </Button>
        </div>
      )}
    </div>
  );
}