import { getLessonById } from "@/lib/supabase/actions";
import { LessonForm } from "@/components/admin/LessonForm";
import { Header } from "@/components/header";
import { notFound } from "next/navigation";

export default async function EditLessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const lessonIdNum = parseInt(params.lessonId, 10);

  if (isNaN(lessonIdNum)) {
    notFound();
  }

  const lesson = await getLessonById(lessonIdNum);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Edit Lesson</h1>
          <p className="text-muted-foreground mb-8">
            Update the details for {lesson.title}.
          </p>
          <LessonForm lesson={lesson} />
        </div>
      </main>
    </div>
  );
}