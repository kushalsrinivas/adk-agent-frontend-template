"use client";

import { type Message } from "~/types/chat";
import { MarkdownRenderer } from "./markdown-renderer";
import { User, Bot, Copy, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`group flex gap-3 p-4 transition-colors ${
        isUser
          ? "border-b border-white/5 bg-white/5 hover:bg-white/10"
          : "border-b border-white/5 bg-white/5 hover:bg-white/10"
      }`}
    >
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-inner ${
          isUser
            ? "bg-gradient-to-br from-cyan-500 to-blue-600"
            : "bg-gradient-to-br from-zinc-700 to-zinc-800"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {isUser ? "You" : "Assistant"}
          </span>
          <span className="text-xs text-white/60">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <div className="text-white/90">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}

          {message.isStreaming && (
            <div className="mt-2 flex items-center gap-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-500">Thinking...</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-8 w-8 p-0 text-white/60 hover:text-white"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>
      </div>
    </div>
  );
}
