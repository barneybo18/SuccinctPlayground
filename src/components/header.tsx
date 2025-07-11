import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="w-full p-4 px-8 flex justify-between items-center border-b">
      <Link href="/" className="text-2xl font-bold tracking-tighter">
        Succinct Playground
      </Link>
      <div>
        <SignedIn>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
        <SignedOut>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost"><Link href="/dashboard">Dashboard</Link></Button>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </header>
  );
}