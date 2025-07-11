import { getLessons } from "@/lib/supabase/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { DeleteLessonButton } from "@/components/admin/DeleteLessonButton";

export default async function AdminDashboard() {
  const lessons = await getLessons();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your lessons and quizzes here.
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/upload">
                <Plus className="mr-2 h-4 w-4" /> Create New Lesson
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardHeader>
                  <CardTitle className="truncate">{lesson.title}</CardTitle>
                  <CardDescription>
                    {lesson.quiz_questions.length} questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {lesson.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/edit/${lesson.id}`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <DeleteLessonButton lessonId={lesson.id} />
                </CardFooter>
              </Card>
            ))}
            {lessons.length === 0 && (
              <div className="col-span-full text-center p-12 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No Lessons Found</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  It looks like you haven't created any lessons yet.
                </p>
                <Button asChild>
                  <Link href="/admin/upload">
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Lesson
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}