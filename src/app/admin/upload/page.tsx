"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { X, Plus } from "lucide-react";
import { uploadLesson } from "@/lib/supabase/actions";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [readingMaterial, setReadingMaterial] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionChange = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", options: ["", "", "", ""], answer: "" }
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const lessonData = {
        title,
        description,
        reading_material: readingMaterial,
        quiz_questions: questions.map((q: Question) => ({
          ...q,
          options: q.options.filter((opt) => opt.trim() !== ""),
        })),
      };

      const result = await uploadLesson(lessonData);

      if (result.success) {
        alert("Lesson uploaded successfully!");
        setTitle("");
        setDescription("");
        setReadingMaterial("");
        setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An unexpected error occurred. Please check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Lesson</CardTitle>
              <CardDescription>Fill out the details for the new learning module.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="readingMaterial">Reading Material (HTML or Markdown)</Label>
                <Textarea id="readingMaterial" value={readingMaterial} onChange={(e) => setReadingMaterial(e.target.value)} rows={10} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiz Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border rounded-lg space-y-3 relative">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeQuestion(qIndex)}><X className="w-4 h-4" /></Button>
                  <div>
                    <Label>Question {qIndex + 1}</Label>
                    <Input value={q.question} onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oIndex) => (
                      <Input key={oIndex} placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} />
                    ))}
                  </div>
                  <div>
                    <Label>Correct Answer</Label>
                    <Input placeholder="Copy the correct option text here" value={q.answer} onChange={(e) => handleQuestionChange(qIndex, "answer", e.target.value)} required />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addQuestion}><Plus className="mr-2 h-4 w-4" /> Add Question</Button>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Upload Lesson"}
          </Button>
        </form>
      </main>
    </div>
  );
}