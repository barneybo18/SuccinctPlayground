import { NextPage } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { QuizModule } from "@/components/quiz-module";
import { quizData } from "@/lib/quiz-data";

type QuizPageProps = {
  params: { quizId: string };
};

const QuizPage: NextPage<QuizPageProps> = ({ params }) => {
  const data = quizData[params.quizId];

  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <QuizModule
          title={data.title}
          summary={data.summary}
          questions={data.questions}
        />
      </main>
    </div>
  );
};

export default QuizPage;