"use client";

import { useEffect, useRef } from "react";
import { type Message } from "~/types/chat";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  currentSessionTitle?: string;
}

export function ChatArea({
  messages,
  onSendMessage,
  isLoading,
  onStop,
  currentSessionTitle,
}: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-transparent">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-white/50" />
            <h2 className="mb-2 text-xl font-semibold text-white/90">
              {currentSessionTitle ?? "Start a conversation"}
            </h2>
            <p className="mx-auto max-w-md text-white/60">
              Send a message to begin your chat. I&apos;m here to help with any
              questions you have.
            </p>
          </div>
        </div>
        <ChatInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          onStop={onStop}
          placeholder="Start typing your message..."
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Chat Header */}
      {currentSessionTitle && (
        <div className="border-b border-white/10 bg-white/5 p-4 backdrop-blur">
          <h1 className="truncate text-lg font-semibold text-white">
            {currentSessionTitle}
          </h1>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="divide-y divide-white/5">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <ChatMessage
              key="assistant_loading"
              message={{
                id: "assistant_loading",
                content: "",
                role: "assistant",
                timestamp: new Date(),
                isStreaming: true,
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        onStop={onStop}
      />
    </div>
  );
}
