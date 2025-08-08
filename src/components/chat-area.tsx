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
      <div className="flex h-screen flex-col overflow-scroll bg-gray-900">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-600" />
            <h2 className="mb-2 text-xl font-semibold text-gray-300">
              {currentSessionTitle ?? "Start a conversation"}
            </h2>
            <p className="max-w-md text-gray-500">
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
    <div className="flex h-full flex-col bg-gray-900">
      {/* Chat Header */}
      {currentSessionTitle && (
        <div className="border-b border-gray-800 bg-gray-950 p-4">
          <h1 className="truncate text-lg font-semibold text-gray-200">
            {currentSessionTitle}
          </h1>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="divide-y divide-gray-800">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
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
