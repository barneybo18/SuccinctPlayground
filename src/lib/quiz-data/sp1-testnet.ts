import { Quiz } from ".";

export const sp1Testnet: Quiz = {
  id: "sp1-testnet",
  title: "SP1 Testnet Launch",
  description: "Learn about the features and capabilities of the SP1 Testnet.",
  summary: `This post announces the launch of the SP1 Testnet, making it possible for developers to start experimenting with full-featured Zero-Knowledge applications using Succinct’s zkVM.

Key features include:

Recursion — the ability to prove other proofs, which is essential for rollup scalability
On-chain verification, enabling Ethereum contracts to validate SP1-generated proofs
Support for Rust's standard library, making development feel familiar and powerful
GPU-based proving, improving performance dramatically

It also lists real-world use cases like light clients, Merkle tree verifiers, and cross-chain bridges, giving developers a playground to explore the next generation of scalable blockchain applications.

And like everything Succinct builds, SP1 is fully open-source, ensuring transparency and developer freedom.`,
  questions: [
    {
      question: "What is recursion in the context of SP1?",
      options: [
        "Hashing a hash",
        "A proof verifying another proof",
        "Looping inside smart contracts",
        "Repeating encryption",
      ],
      answer: "A proof verifying another proof",
    },
    {
      question: "Which kinds of apps can developers build with SP1?",
      options: ["Social media apps", "Games only", "Light clients, bridges, Merkle verifiers", "Chrome extensions"],
      answer: "Light clients, bridges, Merkle verifiers",
    },
    {
      question: "What programming language does SP1 support?",
      options: ["Java", "Rust", "C#", "Go"],
      answer: "Rust",
    },
    {
      question: "What feature allows faster proving in SP1?",
      options: ["Multi-sig wallets", "VRFs", "GPU proving", "Cloud caching"],
      answer: "GPU proving",
    },
    {
      question: "Is SP1 open-source?",
      options: ["No", "Only under license", "Yes", "For partners only"],
      answer: "Yes",
    },
  ],
};