import { Quiz } from ".";

export const networkArchitecture: Quiz = {
  id: "network-architecture",
  title: "Network Architecture & $PROVE Token",
  description: "Dive into the structure of the Succinct Network and its native token.",
  summary: `This blog explores how the Succinct Network is structured and introduces its native $PROVE token. Proof requests begin in an off-chain auctioneer service, which matches jobs to provers. Once a prover wins a job through a reverse auction (lowest bid wins), the result and payment are settled using on-chain Ethereum smart contracts.

The $PROVE token is central to the network’s incentive design. It’s used for:

Paying provers for their work
Staking, to ensure provers have skin in the game
Governance, giving token holders a say in protocol upgrades

This structure keeps the system both decentralized and economically aligned, creating a healthy market for ZK proving at scale. It ensures that provers are rewarded for good behavior and can be penalized for bad behavior.`,
  questions: [
    {
      question: "What two layers define Succinct’s network architecture?",
      options: ["Frontend and backend", "On-chain and off-chain", "Web2 and Web3", "Relay and consensus"],
      answer: "On-chain and off-chain",
    },
    {
      question: "What role does the $PROVE token play in the network?",
      options: [
        "It’s just a meme token",
        "Payments, staking, and governance",
        "Buying NFTs",
        "Rewards for only validators",
      ],
      answer: "Payments, staking, and governance",
    },
    {
      question: "How do provers win proof jobs?",
      options: ["Highest bidder wins", "Round-robin rotation", "Random selection", "Lowest bid in a reverse auction"],
      answer: "Lowest bid in a reverse auction",
    },
    {
      question: "Why are ZKPs important in this setup?",
      options: [
        "They compress images",
        "They help decentralize storage",
        "They allow verifiable computation without trust",
        "They speed up browsing",
      ],
      answer: "They allow verifiable computation without trust",
    },
    {
      question: "What makes this architecture efficient?",
      options: ["Proofs are done manually", "Jobs are always sent to the same prover", "It uses a market-based auction system", "It only runs during weekdays"],
      answer: "It uses a market-based auction system",
    },
  ],
};