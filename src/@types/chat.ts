export interface ChatSession {
    id: string
    title: string
    createdAt: Date
    updatedAt: Date
    messageCount: number
  }
  
  export interface Message {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: Date
    sessionId: string
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
    message: string
    // Add other response fields as needed
  }
  