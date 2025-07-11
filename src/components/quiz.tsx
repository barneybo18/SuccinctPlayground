"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Award, RotateCw } from "lucide-react";


interface QuizProps {
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
  lessonId: string;
  userId: string;
}

export function Quiz({ questions, lessonId, userId }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState<"playing" | "submitted" | "submitting">("playing");

  const handleSelectOption = (option: string) => {
    if (quizState !== "playing") return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: option,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setQuizState("submitting"); // This will show "Submitting..." on the button

    // Calculate the score immediately so the results view has the correct data
    let finalScore = 0;
    for (let i = 0; i < questions.length; i++) {
      if (selectedAnswers[i] === questions[i].answer) {
        finalScore++;
      }
    }

    // Update the score in state and switch to the results view
    setScore(finalScore);
    setQuizState("submitted");
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setQuizState("playing");
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = selectedAnswers[currentQuestionIndex];

  if (quizState === "submitted") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-8 h-8 text-yellow-500" />
            Quiz Results
          </CardTitle>
          <CardDescription>
            You scored {score} out of {questions.length}!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <p className="font-semibold mb-2">{q.question}</p>
                <div className="flex items-center gap-2 text-sm">
                  {selectedAnswers[index] === q.answer ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <p>Your answer: {selectedAnswers[index] || "Not answered"}</p>
                </div>
                {selectedAnswers[index] !== q.answer && (
                  <p className="text-sm text-green-600 mt-1">Correct answer: {q.answer}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRestart}>
            <RotateCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Time!</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-lg font-semibold mb-6">{currentQuestion.question}</p>
            <RadioGroup value={selectedOption} onValueChange={handleSelectOption}>
              {currentQuestion.options.map((option) => (
                <div key={option} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handlePrev} disabled={currentQuestionIndex === 0}>Previous</Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button onClick={handleNext} disabled={!selectedOption}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!selectedOption || quizState === "submitting"}>
            {quizState === "submitting" ? "Submitting..." : "Submit"}
          </Button>
        )}
      </CardFooter>
    </Card>
)};