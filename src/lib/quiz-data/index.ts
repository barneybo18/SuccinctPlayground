import { networkIntro } from "./network-intro";
import { sp1Live } from "./sp1-live";
import { networkArchitecture } from "./network-architecture";
import { explorerLive } from "./explorer-live";
import { sp1Testnet } from "./sp1-testnet"
import { vapps } from "./vapps"

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  summary: string;
  questions: QuizQuestion[];
}

export const quizData: { [key: string]: Quiz } = {
  "network-intro": networkIntro,
  "sp1-live": sp1Live,
  "network-architecture": networkArchitecture,
  "explorer-live": explorerLive,
  "sp1-testnet": sp1Testnet,
  vapps: vapps,
};

// An array for easy mapping on the dashboard
export const quizList = Object.values(quizData);