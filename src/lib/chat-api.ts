import { ChatSession, Message } from '~/types/chat'

// Placeholder function to create a new chat session
export async function createNewSession(): Promise<ChatSession> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newSession: ChatSession = {
    id: `session_${Date.now()}`,
    title: 'New Chat',
    timestamp: new Date(),
    messageCount: 0
  }
  
  return newSession
}

// Placeholder function to retrieve all chat sessions
export async function getChatSessions(): Promise<ChatSession[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Mock data
  return [
    {
      id: 'session_1',
      title: 'React Best Practices',
      lastMessage: 'Thanks for the explanation!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      messageCount: 12
    },
    {
      id: 'session_2',
      title: 'TypeScript Help',
      lastMessage: 'How do I define interfaces?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      messageCount: 8
    },
    {
      id: 'session_3',
      title: 'API Design Discussion',
      lastMessage: 'What about REST vs GraphQL?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      messageCount: 25
    }
  ]
}

// Placeholder function to get messages for a specific session
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400))
  
  // Mock messages based on session
  if (sessionId === 'session_1') {
    return [
      {
        id: 'msg_1',
        content: 'What are some React best practices I should follow?',
        role: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 35)
      },
      {
        id: 'msg_2',
        content: `Here are some key React best practices:

## Component Organization
- Keep components small and focused
- Use functional components with hooks
- Separate logic from presentation

## State Management
- Use \`useState\` for local state
- Consider \`useReducer\` for complex state
- Lift state up when needed

## Performance
- Use \`React.memo\` for expensive components
- Implement proper key props in lists
- Avoid inline functions in render

Would you like me to elaborate on any of these points?`,
        role: 'assistant',
        timestamp: new Date(Date.now() - 1000 * 60 * 34)
      },
      {
        id: 'msg_3',
        content: 'Thanks for the explanation!',
        role: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 30)
      }
    ]
  }
  
  return []
}

// Placeholder function to send a message
export async function sendMessage(sessionId: string, content: string): Promise<Message> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return a mock AI response
  const responses = [
    "That's a great question! Let me help you with that.",
    "I understand what you're looking for. Here's my take on it:",
    "Interesting point! Here's what I think:",
    "Let me break this down for you:",
    "That's a common challenge. Here's how you can approach it:"
  ]
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)]
  
  return {
    id: `msg_${Date.now()}`,
    content: `${randomResponse}\n\n*This is a placeholder response from your backend.*`,
    role: 'assistant',
    timestamp: new Date()
  }
}

// Placeholder function to delete a session
export async function deleteSession(sessionId: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  console.log(`Deleted session: ${sessionId}`)
}

// Placeholder function to update session title
export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  console.log(`Updated session ${sessionId} title to: ${title}`)
}
