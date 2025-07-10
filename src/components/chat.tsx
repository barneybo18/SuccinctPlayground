"use client";

import { useChat } from "ai/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizonal } from "lucide-react";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
    });

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Chat with SP1</CardTitle>
        <CardDescription>
          Your personal guide to the world of Succinct and Zero-Knowledge.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className="flex gap-3 text-slate-800 dark:text-slate-300 text-sm"
              >
                {m.role === "user" ? (
                  <Avatar>
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar>
                    <AvatarFallback>SP1</AvatarFallback>
                    <AvatarImage src="https://www.succinct.xyz/succinct-logo.svg" />
                  </Avatar>
                )}
                <p className="leading-relaxed">
                  <span className="block font-bold text-slate-900 dark:text-slate-50">
                    {m.role === "user" ? "You" : "SP1"}
                  </span>
                  {m.content}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form className="w-full flex gap-2" onSubmit={handleSubmit}>
          <Input
            value={input}
            placeholder="Ask anything about ZK or Succinct..."
            onChange={handleInputChange}
          />
          <Button type="submit" disabled={isLoading}>
            <SendHorizonal className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}