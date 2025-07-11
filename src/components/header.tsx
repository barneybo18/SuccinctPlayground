import Link from "next/link";

export function Header() {
  return (
    <header className="w-full p-4 px-8 flex justify-between items-center border-b">
      <Link href="/" className="text-2xl font-bold tracking-tighter">
        Succinct Playground
      </Link>
    </header>
  );
}