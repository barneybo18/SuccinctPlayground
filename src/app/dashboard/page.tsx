import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard-client";

// Define the shape of the lesson module for the client component.
// This ensures type safety and clarity between server and client.
interface ClientLesson {
  id: string;
  title: string;
  description: string | null;
  status: "Not Started" | "Completed" | "Locked";
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch all lessons from the database
  const { data: allLessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, title, description")
    .order("created_at", { ascending: true });

  if (lessonsError) {
    console.error("Error fetching lessons:", lessonsError);
    // You might want to show an error state to the user
    return <div>Error loading lessons.</div>;
  }

  // With progress tracking removed, all lessons are now available to start.
  const learningModules: ClientLesson[] =
    allLessons?.map((lesson) => ({
      ...lesson,
      id: String(lesson.id), // Convert id to string to match ClientLesson
      status: "Not Started", // This is now correctly typed via ClientLesson
    })) || [];

  return <DashboardClient lessons={learningModules} />;
}