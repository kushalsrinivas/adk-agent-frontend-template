"use client";

import { useState, useEffect } from "react";
import { type Message, type ChatState, type ChatSession } from "~/types/chat";
import { ChatSessionsSidebar } from "~/components/chat-sessions-sidebar";
import { ChatArea } from "~/components/chat-area";
import { Button } from "~/components/ui/button";
import { Menu, X } from "lucide-react";
import {
  createNewSession,
  getChatSessions,
  getSessionMessages,
  sendMessage,
  deleteSession,
  updateSessionTitle,
} from "~/lib/chat-api";
import LandingHero from "~/components/landing-hero";

export default function ChatApp({ userId }: { userId: string }) {
  const [state, setState] = useState<ChatState>({
    sessions: [],
    currentSessionId: null,
    messages: [],
    isLoading: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load initial sessions
  useEffect(() => {
    void loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSessions = async () => {
    try {
      const sessions = await getChatSessions(userId);
      setState((prev) => ({ ...prev, sessions }));
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const handleCreateSession = async (): Promise<ChatSession> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const newSession = await createNewSession(userId);
      setState((prev) => ({
        ...prev,
        sessions: [newSession, ...prev.sessions],
        currentSessionId: newSession.id,
        messages: [],
        isLoading: false,
      }));
      setSidebarOpen(false);
      return newSession;
    } catch (error) {
      console.error("Failed to create session:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === state.currentSessionId) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const messages = await getSessionMessages(userId, sessionId);
      setState((prev) => ({
        ...prev,
        currentSessionId: sessionId,
        messages,
        isLoading: false,
      }));
      setSidebarOpen(false);
    } catch (error) {
      console.error("Failed to load session messages:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleSendMessage = async (content: string) => {
    // Ensure session exists before sending
    let sessionIdToUse = state.currentSessionId;
    if (!sessionIdToUse) {
      try {
        const created = await handleCreateSession();
        sessionIdToUse = created.id;
      } catch (e) {
        console.error("Cannot create session before sending message", e);
        return;
      }
    }

    try {
      // Add user message immediately
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        content,
        role: "user",
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
      }));

      // Send message and get AI response
      const aiResponse = await sendMessage(userId, sessionIdToUse, content);

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, aiResponse],
        isLoading: false,
        sessions: prev.sessions.map((session) =>
          session.id === state.currentSessionId
            ? {
                ...session,
                lastMessage: content,
                timestamp: new Date(),
                messageCount: session.messageCount + 2,
                title:
                  session.messageCount === 0
                    ? content.slice(0, 30) + "..."
                    : session.title,
              }
            : session,
        ),
      }));
    } catch (error) {
      console.error("Failed to send message:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      setState((prev) => ({
        ...prev,
        sessions: prev.sessions.filter((s) => s.id !== sessionId),
        currentSessionId:
          prev.currentSessionId === sessionId ? null : prev.currentSessionId,
        messages: prev.currentSessionId === sessionId ? [] : prev.messages,
      }));
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      await updateSessionTitle(sessionId, newTitle);
      setState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((session) =>
          session.id === sessionId ? { ...session, title: newTitle } : session,
        ),
      }));
    } catch (error) {
      console.error("Failed to rename session:", error);
    }
  };

  const currentSession = state.sessions.find(
    (s) => s.id === state.currentSessionId,
  );

  const showLanding =
    state.currentSessionId === null && state.messages.length === 0;

  return (
    <div className="flex h-screen bg-transparent text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && !showLanding && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!showLanding && (
        <div
          className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:z-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out lg:translate-x-0`}
        >
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
      )}

      {/* Main content */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-300 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <h1 className="truncate text-lg font-semibold text-white">
            {currentSession?.title ?? "AI Chat"}
          </h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Landing vs Chat */}
        {showLanding ? (
          <LandingHero onSubmit={handleSendMessage} />
        ) : (
          <ChatArea
            messages={state.messages}
            onSendMessage={handleSendMessage}
            isLoading={state.isLoading}
            currentSessionTitle={currentSession?.title}
          />
        )}
      </div>
    </div>
  );
}
