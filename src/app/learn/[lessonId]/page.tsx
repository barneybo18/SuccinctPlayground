import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/header";
import { Quiz } from "@/components/quiz";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


interface LessonPageProps {
  params: {
    lessonId: string;
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const supabase = await createClient();
  const { userId } = await auth();

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", params.lessonId)
    .single();

  if (error || !lesson) {
    notFound();
  }

  // The quiz questions are stored as JSONB in Supabase
  const quizQuestions = (lesson.quiz_questions as any) || [];


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {lesson.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {lesson.description}
          </p>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Reading Material</CardTitle>
            </CardHeader>
             <CardContent>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.reading_material || "" }}
              />
            </CardContent>
          </Card>

          {quizQuestions.length > 0 &&
            (userId ? (
              <Quiz
                lessonId={lesson.id}
                userId={userId}
                questions={quizQuestions}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sign in to take the quiz</CardTitle>
                  <CardDescription>
                    You need to be signed in to save your progress.
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
        </div>
      </main>
    </div>
  );
}