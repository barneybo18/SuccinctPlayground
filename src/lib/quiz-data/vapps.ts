import { Quiz } from ".";

export const vapps: Quiz = {
  id: "vapps",
  title: "vApps: Verifiable Applications",
  description:
    "Learn how vApps combine web2 ergonomics with web3 verifiability and test your knowledge.",
  summary: `vApps—short for verifiable applications—are a new paradigm introduced by Succinct in partnership with LayerZero. They merge web2 developer ergonomics with web3-grade verifiability, enabling developers to write in familiar environments while ensuring transparent, trust-minimized execution.

Traditional decentralized applications (dApps) rely heavily on native blockchain languages like Solidity and the EVM, which bring heavy constraints such as limited throughput, developer friction, and the need to manage complex backend logic and state syncing. vApps break free from these limitations by allowing developers to build using Rust SDKs, leveraging Succinct’s SP1 zkVM and decentralized prover network to handle all the proof generation, interoperability, and settlement automatically.

Instead of building monolithic, siloed backends, developers can use vApps to add verifiability to web2 logic—from ad exchanges to healthcare platforms—at internet scale. This leverages SP1’s native Rust execution for massive performance gains over interpreted VM models (up to 832× faster) and fully abstracts on-chain/off-chain integration, so applications are both fast and auditable.

By opening the door for applications to be built natively in Rust, vApps truly deliver on web3’s promise of trustlessness, composability, and permissionless innovation—across web2 and web3 alike.`,
  questions: [
    {
      question: "What are vApps?",
      options: [
        "Virtual reality applications",
        "Verifiable applications combining web2 ease with crypto-grade transparency",
        "Only for blockchain games",
        "A new NFT standard",
      ],
      answer:
        "Verifiable applications combining web2 ease with crypto-grade transparency",
    },
    {
      question: "Which language and SDK are used to build vApps?",
      options: ["Solidity SDK", "JavaScript SDK", "Rust SDK", "Python SDK"],
      answer: "Rust SDK",
    },
    {
      question:
        "What major limitation do vApps overcome compared to traditional dApps?",
      options: [
        "Poor mobile performance",
        "Lack of front-end UI",
        "Constraints of EVM, Solidity, and custom backend infrastructure",
        "High cost of bi-annual updates",
      ],
      answer: "Constraints of EVM, Solidity, and custom backend infrastructure",
    },
    {
      question: "What component of Succinct enables fast, native execution for vApps?",
      options: [
        "SP1 zkVM with native Rust execution",
        "A Solidity interpreter",
        "LayerZero’s messaging system",
        "A JavaScript runtime",
      ],
      answer: "SP1 zkVM with native Rust execution",
    },
  ],
};