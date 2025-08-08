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

export interface SendMessageRequest {
  app_name: string
  user_id: string
  session_id: string
  new_message: {
    parts: Array<{ text: string }>
    role: 'user'
  }
}

export interface SendMessageResponse {
  message?: string
  content?: string
  parts?: Array<{ text?: string }>
  [key: string]: unknown
}


