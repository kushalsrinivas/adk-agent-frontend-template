export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isStreaming?: boolean
}

export interface ChatSession {
  id: string
  title: string
  lastMessage?: string
  timestamp: Date
  messageCount: number
}

export interface ChatState {
  sessions: ChatSession[]
  currentSessionId: string | null
  messages: Message[]
  isLoading: boolean
}
