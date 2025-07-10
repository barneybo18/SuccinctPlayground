"use server";

import { createClient } from "./server";
import { revalidatePath } from "next/cache";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface LessonData {
  title: string;
  description: string;
  reading_material: string;
  quiz_questions: QuizQuestion[];
}

export async function uploadLesson(lessonData: LessonData) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("lessons").insert([lessonData]);

  if (error) {
    console.error("Error uploading lesson:", error);
    return { error: "Could not upload lesson." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function completeQuiz(lessonId: string, userId: string, score: number, totalQuestions: number) {
    const supabase = await createClient();
    // Using upsert to either create or update the user's progress for a specific lesson
    const { error } = await supabase.from('user_progress').upsert({
        user_id: userId,
        lesson_id: lessonId, // You may need to add this column to your 'user_progress' table
        status: 'completed',
        score: score,
    }, { onConflict: 'user_id, lesson_id' });

    if (error) console.error('Error updating progress:', error);
    revalidatePath('/dashboard');
}