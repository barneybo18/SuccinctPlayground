import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { DashboardClient } from "@/components/dashboard-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

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

  // 2. Fetch the user's progress for all lessons
  const { data: userProgress, error: progressError } = await supabase
    .from("user_progress")
    .select("lesson_id, status")
    .eq("user_id", userId);

  if (progressError) {
    console.error("Error fetching user progress:", progressError);
  }

  const completedLessons = new Set(
    userProgress?.filter((p) => p.status === "completed").map((p) => p.lesson_id)
  );

  // 3. Combine lessons with progress to determine the status for each module
  // A lesson is unlocked if the previous one has been completed.
  const learningModules =
    allLessons?.map((lesson, index) => {
      const isCompleted = completedLessons.has(lesson.id);
      let isUnlocked = false;

      // The first lesson is always unlocked.
      if (index === 0) {
        isUnlocked = true;
      } else {
        // A lesson is unlocked if the previous one is completed.
        const previousLesson = allLessons?.[index - 1];
        if (previousLesson && completedLessons.has(previousLesson.id)) {
          isUnlocked = true;
        }
      }

      let status: "Not Started" | "Completed" | "Locked" = "Locked";
      if (isCompleted) {
        status = "Completed";
      } else if (isUnlocked) {
        status = "Not Started";
      }

      return {
        ...lesson,
        status,
      };
    }) || [];

  const progress = {
    completed_modules: completedLessons.size,
    total_modules: allLessons?.length || 0,
  };

  return <DashboardClient lessons={learningModules} />;
}