"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  onStop,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="border-t border-white/10 bg-white/5 p-4 backdrop-blur">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="max-h-32 min-h-[44px] resize-none border-white/10 bg-white/5 text-white backdrop-blur placeholder:text-white/40 focus:border-white/20 focus:ring-0"
            disabled={isLoading}
          />
        </div>

        {isLoading ? (
          <Button
            type="button"
            onClick={onStop}
            size="sm"
            variant="outline"
            className="h-11 border-white/10 px-3 text-white hover:bg-white/10"
          >
            <Square size={16} />
          </Button>
        ) : (
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim()}
            className="h-11 bg-white/20 px-3 text-white hover:bg-white/30 disabled:opacity-50"
          >
            <Send size={16} />
          </Button>
        )}
      </form>
    </div>
  );
}
