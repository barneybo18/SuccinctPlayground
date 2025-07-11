"use client";

import { LessonForm } from "@/components/admin/LessonForm";
import { Header } from "@/components/header";

export default function UploadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create New Lesson</h1>
          <p className="text-muted-foreground mb-8">
            Fill out the details for the new learning module.
          </p>
          <LessonForm />
        </div>
      </main>
    </div>
  );
}