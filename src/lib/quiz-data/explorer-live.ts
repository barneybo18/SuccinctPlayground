import { Quiz } from ".";

export const explorerLive: Quiz = {
  id: "explorer-live",
  title: "The Succinct Network Explorer",
  description: "Explore the tool that brings transparency to the Succinct proving ecosystem.",
  summary: `To make its proving ecosystem transparent and easy to explore, Succinct launched the Succinct Explorer — a tool that tracks all activity on the network. Think of it like Etherscan, but specifically for ZK jobs and provers.

Through the Explorer, you can:

See recent proof requests
Check which provers are most active or reliable
Track performance metrics, success/failure rates, and more

It’s especially useful for developers, researchers, or protocol teams trying to understand who to trust and how the system behaves over time. This level of visibility builds trust and promotes accountability, making sure decentralization doesn’t come at the cost of insight.

Succinct also encourages feedback from users, helping make the Explorer even more useful as the network evolves.`,
  questions: [
    {
      question: "What is the purpose of the Succinct Explorer?",
      options: ["Generate ZK proofs", "View proof jobs and prover activity", "Buy crypto tokens", "Edit smart contracts"],
      answer: "View proof jobs and prover activity",
    },
    {
      question: "Who is the Explorer built for?",
      options: ["NFT artists", "Just Succinct devs", "Developers and ZK ecosystem participants", "Bitcoin miners"],
      answer: "Developers and ZK ecosystem participants",
    },
    {
      question: "What kind of data does the Explorer provide?",
      options: ["NFT collections", "Gas prices", "Proof records and prover stats", "Game scores"],
      answer: "Proof records and prover stats",
    },
    {
      question: "Why is transparency important in a prover network?",
      options: ["To attract investors", "To reward NFT creators", "To ensure accountability and reliability", "To mint tokens"],
      answer: "To ensure accountability and reliability",
    },
    {
      question: "How can users help improve the Explorer?",
      options: ["By donating $ETH", "By mining blocks", "By giving feedback and suggestions", "By creating memes"],
      answer: "By giving feedback and suggestions",
    },
  ],
};