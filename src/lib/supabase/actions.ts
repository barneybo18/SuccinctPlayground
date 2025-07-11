"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Define types for our data
export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface Lesson {
  id: number;
  created_at: string;
  title: string;
  description: string;
  reading_material: string;
  quiz_questions: Question[];
}

export type LessonFormData = Omit<Lesson, "id" | "created_at">;

// Action to upload a new lesson
export async function uploadLesson(lessonData: LessonFormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .insert([lessonData])
    .select();

  if (error) {
    console.error("Error uploading lesson:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true, data };
}

// Action to get all lessons
export async function getLessons(): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }

  return lessons || [];
}

// Action to get a single lesson by ID
export async function getLessonById(lessonId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// Action to update a lesson
export async function updateLesson(lessonId: number, lessonData: LessonFormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update(lessonData)
    .eq("id", lessonId);

  if (error) {
    console.error(`Error updating lesson ${lessonId}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/edit/${lessonId}`);
  return { success: true };
}

// Action to delete a lesson
export async function deleteLesson(lessonId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}