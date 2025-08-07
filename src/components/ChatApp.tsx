'use client'

import { useState, useEffect } from 'react'
import { type ChatSession, type Message, type ChatState } from '~/@types/chat'
import { ChatSessionsSidebar } from '~/components/chat-sessions-sidebar'
import { ChatArea } from '~/components/chat-area'
import { Button } from '~/components/ui/button'
import { Menu, X } from 'lucide-react'
import {
  createNewSession,
  getChatSessions,
  getSessionMessages,
  sendMessage,
  deleteSession,
  updateSessionTitle
} from '~/lib/chat-api'

export default function ChatApp() {
  const [state, setState] = useState<ChatState>({
    sessions: [],
    currentSessionId: null,
    messages: [],
    isLoading: false
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Load initial sessions
  useEffect(() => {
   void loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const sessions = await getChatSessions()
      setState(prev => ({ ...prev, sessions }))
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const handleCreateSession = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      const newSession = await createNewSession()
      setState(prev => ({
        ...prev,
        sessions: [newSession, ...prev.sessions],
        currentSessionId: newSession.id,
        messages: [],
        isLoading: false
      }))
      setSidebarOpen(false)
    } catch (error) {
      console.error('Failed to create session:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === state.currentSessionId) return

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      const messages = await getSessionMessages(sessionId)
      setState(prev => ({
        ...prev,
        currentSessionId: sessionId,
        messages,
        isLoading: false
      }))
      setSidebarOpen(false)
    } catch (error) {
      console.error('Failed to load session messages:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!state.currentSessionId) {
      // Create new session if none exists
      await handleCreateSession()
      return
    }

    try {
      // Add user message immediately
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        content,
        role: 'user',
        timestamp: new Date()
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true
      }))

      // Send message and get AI response
      const aiResponse = await sendMessage(state.currentSessionId, content)
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiResponse],
        isLoading: false,
        sessions: prev.sessions.map(session =>
          session.id === state.currentSessionId
            ? {
                ...session,
                lastMessage: content,
                timestamp: new Date(),
                messageCount: session.messageCount + 2,
                title: session.messageCount === 0 ? content.slice(0, 30) + '...' : session.title
              }
            : session
        )
      }))
    } catch (error) {
      console.error('Failed to send message:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId)
      setState(prev => ({
        ...prev,
        sessions: prev.sessions.filter(s => s.id !== sessionId),
        currentSessionId: prev.currentSessionId === sessionId ? null : prev.currentSessionId,
        messages: prev.currentSessionId === sessionId ? [] : prev.messages
      }))
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      await updateSessionTitle(sessionId, newTitle)
      setState(prev => ({
        ...prev,
        sessions: prev.sessions.map(session =>
          session.id === sessionId ? { ...session, title: newTitle } : session
        )
      }))
    } catch (error) {
      console.error('Failed to rename session:', error)
    }
  }

  const currentSession = state.sessions.find(s => s.id === state.currentSessionId)

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-200 ease-in-out
      `}>
        <ChatSessionsSidebar
          sessions={state.sessions}
          currentSessionId={state.currentSessionId}
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          isLoading={state.isLoading}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-200"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <h1 className="text-lg font-semibold text-gray-200 truncate">
            {currentSession?.title || 'AI Chat'}
          </h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Chat area */}
        <ChatArea
          messages={state.messages}
          onSendMessage={handleSendMessage}
          isLoading={state.isLoading}
          currentSessionTitle={currentSession?.title}
        />
      </div>
    </div>
  )
}
