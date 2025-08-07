'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Send, Square } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (content: string) => void
  isLoading: boolean
  onStop?: () => void
  placeholder?: string
}

export function ChatInput({ 
  onSendMessage, 
  isLoading, 
  onStop, 
  placeholder = "Type your message..." 
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  return (
    <div className="border-t border-gray-800 bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[44px] max-h-32 resize-none bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        
        {isLoading ? (
          <Button
            type="button"
            onClick={onStop}
            size="sm"
            variant="outline"
            className="h-11 px-3 border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Square size={16} />
          </Button>
        ) : (
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim()}
            className="h-11 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={16} />
          </Button>
        )}
      </form>
    </div>
  )
}
