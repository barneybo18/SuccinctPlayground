import { Quiz } from ".";

export const networkIntro: Quiz = {
  id: "network-intro",
  title: "Introducing Succinct Network",
  description: "Learn the fundamentals of the Succinct Network and its mission.",
  summary: `This blog lays the foundation for what Succinct is building: a decentralized way to prove that a computation happened correctly — without relying on centralized infrastructure. Today, most blockchain apps either trust a server or build custom proving systems. This creates fragmentation and inefficiency.

Succinct solves this with Zero-Knowledge Proofs (ZKPs) — a cryptographic method that proves something is true without showing how it’s true. For instance, you can prove someone has over 18 years of age without revealing their exact age.

The Succinct Network is made up of provers, decentralized nodes that generate ZK proofs. Developers can submit proof jobs, and these provers compete to fulfill them in a reverse auction (lowest bid wins). This removes the need for custom deployments and provides a plug-and-play proving layer that works for apps like rollups, bridges, coprocessors, and oracles.

In short, Succinct turns ZK proving into a service — fast, decentralized, and accessible to all.`,
  questions: [
    {
      question: "What is the core problem Succinct aims to solve?",
      options: [
        "Making NFTs cheaper",
        "Proving computation without needing trust",
        "Improving internet speed",
        "Reducing blockchain size",
      ],
      answer: "Proving computation without needing trust",
    },
    {
      question: "Why are traditional proof systems considered fragmented?",
      options: [
        "They rely on GPU usage",
        "They lack open-source libraries",
        "They require custom deployments",
        "They only work with specific tokens",
      ],
      answer: "They require custom deployments",
    },
    {
      question: "Which types of apps can benefit from Succinct’s proving system?",
      options: [
        "Video streaming platforms",
        "Rollups, bridges, and oracles",
        "DeFi-only protocols",
        "Password managers",
      ],
      answer: "Rollups, bridges, and oracles",
    },
    {
      question: "What do provers in the Succinct network actually do?",
      options: ["Host validator nodes", "Generate ZK proofs", "Run smart contracts", "Provide liquidity"],
      answer: "Generate ZK proofs",
    },
    {
      question: "What makes Succinct’s approach more efficient than traditional setups?",
      options: ["It uses a single central server", "It avoids blockchain entirely", "It uses decentralized proving", "It has a user-facing app"],
      answer: "It uses decentralized proving",
    },
  ],
};