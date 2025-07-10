"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeQuiz(moduleId: string, score: number) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: userId,
        module_id: moduleId,
        status: "completed",
        score: score,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id, module_id" }
    )
    .select();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to save quiz progress.");
  }

  // Revalidate the dashboard to show the updated progress
  revalidatePath("/dashboard");

  return data;
}