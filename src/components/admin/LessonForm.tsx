"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import {
  uploadLesson,
  updateLesson,
  LessonFormData,
  Lesson,
} from "@/lib/supabase/actions";

interface LessonFormProps {
  lesson?: Lesson;
}

export function LessonForm({ lesson }: LessonFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    description: "",
    reading_material: "",
    quiz_questions: [{ question: "", options: ["", "", "", ""], answer: "" }],
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        description: lesson.description || "",
        reading_material: lesson.reading_material,
        quiz_questions:
          lesson.quiz_questions?.length > 0
            ? lesson.quiz_questions
            : [{ question: "", options: ["", "", "", ""], answer: "" }],
      });
    }
  }, [lesson]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleQuestionChange = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    const newQuestions = [...formData.quiz_questions];
    newQuestions[index][field] = value;
    setFormData((prev) => ({ ...prev, quiz_questions: newQuestions }));
  };

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    const newQuestions = [...formData.quiz_questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData((prev) => ({ ...prev, quiz_questions: newQuestions }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      quiz_questions: [
        ...prev.quiz_questions,
        { question: "", options: ["", "", "", ""], answer: "" },
      ],
    }));
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.quiz_questions.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, quiz_questions: newQuestions }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const processedData = {
      ...formData,
      quiz_questions: formData.quiz_questions.map((q) => ({
        ...q,
        options: q.options.filter((opt) => opt && opt.trim() !== ""),
      })),
    };

    try {
      if (lesson) {
        const result = await updateLesson(lesson.id, processedData);
        if (result.success) {
          router.push("/admin");
        } else {
          console.error("Update failed:", result.error);
          alert(`Error: ${result.error}`);
        }
      } else {
        const result = await uploadLesson(processedData);
        if (result.success) {
          router.push("/admin");
        } else {
          console.error("Upload failed:", result.error);
          alert(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An unexpected error occurred. Please check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
          <CardDescription>
            Provide the main content and information for the lesson.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="reading_material">
              Reading Material (HTML or Markdown)
            </Label>
            <Textarea
              id="reading_material"
              value={formData.reading_material}
              onChange={handleInputChange}
              rows={10}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.quiz_questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="p-4 border rounded-lg space-y-3 relative"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeQuestion(qIndex)}
              >
                <X className="w-4 h-4" />
              </Button>
              <div>
                <Label>Question {qIndex + 1}</Label>
                <Input
                  value={q.question}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "question", e.target.value)
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oIndex) => (
                  <Input
                    key={oIndex}
                    placeholder={`Option ${oIndex + 1}`}
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, e.target.value)
                    }
                  />
                ))}
              </div>
              <div>
                <Label>Correct Answer</Label>
                <Input
                  placeholder="Copy the correct option text here"
                  value={q.answer}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "answer", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? lesson
            ? "Updating..."
            : "Uploading..."
          : lesson
          ? "Update Lesson"
          : "Upload Lesson"}
      </Button>
    </form>
  );
}