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

  // With progress tracking removed, all lessons are now available to start.
  const learningModules =
    allLessons?.map((lesson) => ({
      ...lesson,
      status: "Not Started" as "Not Started",
    })) || [];

  return <DashboardClient lessons={learningModules} />;
}