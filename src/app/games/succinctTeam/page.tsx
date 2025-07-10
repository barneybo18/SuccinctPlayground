"use client";
import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface QuizQuestion {
  description: string;
  correctAnswer: string;
  options: string[];
}

const allQuestions: QuizQuestion[] = [
  // @pumatheuma
  { description: 'Shares epic ZK conference selfies with the crypto community.', correctAnswer: '@pumatheuma', options: ['@pumatheuma', '@0xCRASHOUT', '@DanHennessy', '@eliyyang'] },
  { description: 'Posts about their favorite crypto coffee shops on X.', correctAnswer: '@pumatheuma', options: ['@pumatheuma', '@mattstam_eth', '@Lsquaredleland', '@0xpangea'] },
  { description: 'Hypes up Succinct’s latest team meetup with emojis.', correctAnswer: '@pumatheuma', options: ['@pumatheuma', '@chasedevens', '@0xCRASHOUT', '@nair_advaith'] },
  { description: 'Engages fans with ZK-themed polls on X.', correctAnswer: '@pumatheuma', options: ['@pumatheuma', '@eliyyang', '@srachasaucee', '@fakedev9999'] },
  // @0xCRASHOUT
  { description: 'Drops hilarious crypto memes that go viral.', correctAnswer: '@0xCRASHOUT', options: ['@0xCRASHOUT', '@DanHennessy', '@mattstam_eth', '@eliyyang'] },
  { description: 'Shares bold takes on the future of crypto on X.', correctAnswer: '@0xCRASHOUT', options: ['@0xCRASHOUT', '@nair_advaith', '@srachasaucee', '@fakedev9999'] },
  { description: 'Hosts lively X threads about blockchain trends.', correctAnswer: '@0xCRASHOUT', options: ['@0xCRASHOUT', '@pumatheuma', '@chasedevens', '@Lsquaredleland'] },
  { description: 'Cheers on the ZK community with motivational posts.', correctAnswer: '@0xCRASHOUT', options: ['@0xCRASHOUT', '@0xpangea', '@mattstam_eth', '@DanHennessy'] },
  // @DanHennessy
  { description: 'Posts about their crypto-inspired playlist for coding.', correctAnswer: '@DanHennessy', options: ['@DanHennessy', '@eliyyang', '@nair_advaith', '@srachasaucee'] },
  { description: 'Shares behind-the-scenes of Succinct’s hackathons.', correctAnswer: '@DanHennessy', options: ['@DanHennessy', '@pumatheuma', '@0xCRASHOUT', '@fakedev9999'] },
  { description: 'Engages with fans about favorite blockchain games.', correctAnswer: '@DanHennessy', options: ['@DanHennessy', '@mattstam_eth', '@chasedevens', '@0xpangea'] },
  { description: 'Posts fun ZK trivia questions on X.', correctAnswer: '@DanHennessy', options: ['@DanHennessy', '@Lsquaredleland', '@eliyyang', '@pumatheuma'] },
  // @eliyyang
  { description: 'Shares excitement for ZK meetups with cool photos.', correctAnswer: '@eliyyang', options: ['@eliyyang', '@0xCRASHOUT', '@chasedevens', '@0xpangea'] },
  { description: 'Posts about their favorite crypto podcasts on X.', correctAnswer: '@eliyyang', options: ['@eliyyang', '@nair_advaith', '@srachasaucee', '@DanHennessy'] },
  { description: 'Hypes up new ZK projects with enthusiastic threads.', correctAnswer: '@eliyyang', options: ['@eliyyang', '@pumatheuma', '@fakedev9999', '@mattstam_eth'] },
  { description: 'Shares ZK community shoutouts on X.', correctAnswer: '@eliyyang', options: ['@eliyyang', '@0xCRASHOUT', '@Lsquaredleland', '@chasedevens'] },
  // @mattstam_eth
  { description: 'Posts about Succinct’s team outings on X.', correctAnswer: '@mattstam_eth', options: ['@mattstam_eth', '@Lsquaredleland', '@0xpangea', '@pumatheuma'] },
  { description: 'Shares crypto-inspired art they found online.', correctAnswer: '@mattstam_eth', options: ['@mattstam_eth', '@nair_advaith', '@srachasaucee', '@fakedev9999'] },
  { description: 'Engages with followers about ZK event swag.', correctAnswer: '@mattstam_eth', options: ['@mattstam_eth', '@DanHennessy', '@eliyyang', '@0xCRASHOUT'] },
  { description: 'Posts about their favorite blockchain conferences.', correctAnswer: '@mattstam_eth', options: ['@mattstam_eth', '@chasedevens', '@0xpangea', '@pumatheuma'] },
  // @Lsquaredleland
  { description: 'Shares updates on Succinct’s community events.', correctAnswer: '@Lsquaredleland', options: ['@Lsquaredleland', '@mattstam_eth', '@0xpangea', '@pumatheuma'] },
  { description: 'Posts about their love for crypto-themed swag.', correctAnswer: '@Lsquaredleland', options: ['@Lsquaredleland', '@eliyyang', '@nair_advaith', '@srachasaucee'] },
  { description: 'Hypes up ZK workshops with fun posts.', correctAnswer: '@Lsquaredleland', options: ['@Lsquaredleland', '@fakedev9999', '@0xCRASHOUT', '@DanHennessy'] },
  { description: 'Shares ZK community success stories on X.', correctAnswer: '@Lsquaredleland', options: ['@Lsquaredleland', '@chasedevens', '@mattstam_eth', '@eliyyang'] },
  // @chasedevens
  { description: 'Drops ZK-themed memes that crack up the community.', correctAnswer: '@chasedevens', options: ['@chasedevens', '@0xCRASHOUT', '@DanHennessy', '@eliyyang'] },
  { description: 'Shares funny crypto conference moments.', correctAnswer: '@chasedevens', options: ['@chasedevens', '@nair_advaith', '@srachasaucee', '@fakedev9999'] },
  { description: 'Posts lighthearted ZK community banter.', correctAnswer: '@chasedevens', options: ['@chasedevens', '@pumatheuma', '@mattstam_eth', '@Lsquaredleland'] },
  { description: 'Engages with ZK fans through fun X replies.', correctAnswer: '@chasedevens', options: ['@chasedevens', '@0xpangea', '@eliyyang', '@DanHennessy'] },
  // @0xpangea
  { description: 'Shares their crypto travel adventures on X.', correctAnswer: '@0xpangea', options: ['@0xpangea', '@chasedevens', '@eliyyang', '@DanHennessy'] },
  { description: 'Posts about favorite DeFi project updates.', correctAnswer: '@0xpangea', options: ['@0xpangea', '@nair_advaith', '@srachasaucee', '@fakedev9999'] },
  { description: 'Hypes ZK startup launches with cool posts.', correctAnswer: '@0xpangea', options: ['@0xpangea', '@pumatheuma', '@mattstam_eth', '@Lsquaredleland'] },
  { description: 'Shares ZK community vibes on X.', correctAnswer: '@0xpangea', options: ['@0xpangea', '@0xCRASHOUT', '@chasedevens', '@eliyyang'] },
  // @nair_advaith
  { description: 'Shitposts the life out of Succinct', correctAnswer: '@nair_advaith', options: ['@nair_advaith', '@srachasaucee', '@fakedev9999', '@pumatheuma'] },
  { description: 'Uses music as hints to a new Update on Succinct.', correctAnswer: '@nair_advaith', options: ['@nair_advaith', '@DanHennessy', '@0xCRASHOUT', '@mattstam_eth'] },
  { description: 'Known as the Succinct Dev, but spends too much time on X.', correctAnswer: '@nair_advaith', options: ['@nair_advaith', '@eliyyang', '@chasedevens', '@0xpangea'] },
  { description: 'Posts about their favorite ZK swag hauls.', correctAnswer: '@nair_advaith', options: ['@nair_advaith', '@Lsquaredleland', '@mattstam_eth', '@fakedev9999'] },
  // @srachasaucee
  { description: 'Shares fun ZK project launch updates.', correctAnswer: '@srachasaucee', options: ['@srachasaucee', '@nair_advaith', '@fakedev9999', '@pumatheuma'] },
  { description: 'Posts about crypto networking events on X.', correctAnswer: '@srachasaucee', options: ['@srachasaucee', '@0xCRASHOUT', '@DanHennessy', '@eliyyang'] },
  { description: 'Hypes up ZK community giveaways.', correctAnswer: '@srachasaucee', options: ['@srachasaucee', '@mattstam_eth', '@Lsquaredleland', '@chasedevens'] },
  { description: 'Shares their love for blockchain-inspired art.', correctAnswer: '@srachasaucee', options: ['@srachasaucee', '@0xpangea', '@nair_advaith', '@fakedev9999'] },
  // @fakedev9999
  { description: 'Posts about their favorite crypto conference moments.', correctAnswer: '@fakedev9999', options: ['@fakedev9999', '@eliyyang', '@chasedevens', '@Lsquaredleland'] },
  { description: 'Shares ZK community memes on X.', correctAnswer: '@fakedev9999', options: ['@fakedev9999', '@nair_advaith', '@srachasaucee', '@pumatheuma'] },
  { description: 'Engages with followers about ZK events.', correctAnswer: '@fakedev9999', options: ['@fakedev9999', '@0xCRASHOUT', '@DanHennessy', '@mattstam_eth'] },
  { description: 'Posts about their crypto-inspired travel stories.', correctAnswer: '@fakedev9999', options: ['@fakedev9999', '@0xpangea', '@eliyyang', '@chasedevens'] },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  return array.sort(() => Math.random() - 0.5);
};

const getRandomQuestions = (questions: QuizQuestion[], count: number): QuizQuestion[] => {
  const shuffled = shuffleArray([...questions]);
  return shuffled.slice(0, count);
};

const getScoreMessage = (score: number): string => {
  if (score === 10) {
    return 'Whoa! You know the Succinct team like a ZK wizard! 🧙‍♂️';
  } else if (score >= 7) {
    return 'Great job! You’re practically a Succinct insider! 🚀';
  } else if (score >= 5) {
    return 'Not bad! You’ve got a solid grasp of the Succinct crew. 💪';
  } else {
    return 'Bruh, are you even part of the community? 🤣';
  }
};

const Home: NextPage = () => {
  const [quizData, setQuizData] = useState<QuizQuestion[]>(getRandomQuestions(allQuestions, 10));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>(
    shuffleArray([...quizData[0]?.options || allQuestions[0].options]),
  );

  useEffect(() => {
    setQuizData(getRandomQuestions(allQuestions, 10));
  }, []);

  useEffect(() => {
    if (quizData[currentQuestion]) {
      setShuffledOptions(shuffleArray([...quizData[currentQuestion].options]));
    }
  }, [currentQuestion, quizData]);

  const handleAnswer = (selected: string) => {
    const isCorrect = selected === quizData[currentQuestion].correctAnswer;
    setFeedback(isCorrect ? 'Correct!' : `Wrong! The correct answer is ${quizData[currentQuestion].correctAnswer}`);
    if (isCorrect) setScore(score + 1);

    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < quizData.length) {
        setCurrentQuestion(nextQuestion);
        setFeedback('');
      } else {
        setGameOver(true);
        setShowPopup(true);
      }
    }, 1000);
  };

  const restartGame = () => {
    setQuizData(getRandomQuestions(allQuestions, 10));
    setCurrentQuestion(0);
    setScore(0);
    setGameOver(false);
    setFeedback('');
    setShowPopup(false);
    setShuffledOptions(shuffleArray([...quizData[0]?.options || allQuestions[0].options]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-pink-900 text-white flex flex-col items-center justify-center p-4">
      <Head>
        <title>ZK Personality Quiz: Succinct Labs Team</title>
        <meta name="description" content="Guess the Succinct Labs team member based on their X personality!" />
      </Head>
      <div className="relative max-w-2xl w-full bg-black rounded-lg shadow-lg p-6">
        <Link href="/dashboard" passHref>
          <Button variant="ghost" className="absolute top-6 left-6 text-white hover:bg-gray-700 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6 text-pink-600 pt-12 md:pt-0">
          ZK Personality Quiz: Succinct Labs Team
        </h1>
        {gameOver ? (
          <div className="text-center">
            <h2 className="text-2xl mb-4">Game Over!</h2>
            <p className="text-lg mb-4">Your score: {score} / {quizData.length}</p>
            <button
              onClick={restartGame}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded transition"
            >
              Restart Game
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mb-4 ">
              Question {currentQuestion + 1} of {quizData.length}
            </h2>
            <p className="text-lg mb-6 text-pink-600">{quizData[currentQuestion].description}</p>
            <div className="grid grid-cols-1 gap-4">
              {shuffledOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="bg-gray-900 hover:bg-pink-600 text-white py-2 px-4 rounded transition cursor-pointer"
                >
                  {option}
                </button>
              ))}
            </div>
            {feedback && (
              <p className={`mt-4 text-lg ${feedback.includes('Correct') ? 'text-green-400' : 'text-red-400'}`}>
                {feedback}
              </p>
            )}
          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">{getScoreMessage(score)}</h2>
            <p className="text-lg mb-6">Your score: {score} / {quizData.length}</p>
            <button
              onClick={restartGame}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded transition"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;