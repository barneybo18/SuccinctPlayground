import { Quiz } from ".";

export const sp1Live: Quiz = {
  id: "sp1-live",
  title: "SP1 is Live",
  description: "Discover SP1, Succinct's high-performance zkVM, and what makes it powerful.",
  summary: `SP1 is Succinct’s high-performance zkVM (zero-knowledge virtual machine), which allows developers to build ZK-powered applications using the Rust programming language. Unlike older zkVMs that use custom DSLs or niche tools, SP1 makes ZK development more accessible and robust.

The blog highlights that SP1 has already secured over $1 billion in value and generated more than 10,000 proofs, proving it’s ready for real-world use.

One major innovation is SP1’s GPU-based prover — which makes proving up to 10× faster and cheaper than using CPUs. Developers also benefit from on-chain EVM compatibility, meaning proofs can be verified directly on Ethereum using around 275,000 gas.

And because SP1 is fully open-source and audited (with no high/critical issues found), projects can adopt it with confidence. This blog is a clear invitation to developers: ZK is ready for production, and SP1 makes it practical.`,
  questions: [
    {
      question: "What language do developers use to write SP1 programs?",
      options: ["JavaScript", "Python", "Rust", "Solidity"],
      answer: "Rust",
    },
    {
      question: "How many proofs has SP1 completed so far?",
      options: ["1,000", "10,000+", "Less than 100", "500"],
      answer: "10,000+",
    },
    {
      question: "What’s the speed advantage of SP1’s GPU proving system?",
      options: ["2× slower", "5× more expensive", "10× faster and cheaper", "No difference"],
      answer: "10× faster and cheaper",
    },
    {
      question: "How much gas does it take to verify a SP1 proof on Ethereum?",
      options: ["10,000", "50,000", "~275,000", "Over 1 million"],
      answer: "~275,000",
    },
    {
      question: "Why is SP1 considered trustworthy?",
      options: [
        "It’s funded by a DAO",
        "It has no public code",
        "It’s open-source and audited",
        "It uses a closed API",
      ],
      answer: "It’s open-source and audited",
    },
  ],
};