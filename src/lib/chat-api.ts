import { type ChatSession, type Message, type SendMessageRequest, type SendMessageResponse } from '~/types/chat'

const FASTAPI_BASE_URL: string = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL ?? 'http://localhost:8000'
const APP_NAME: string = process.env.NEXT_PUBLIC_APP_NAME ?? 'speaker'

function generateSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback
  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export async function createNewSession(userId: string): Promise<ChatSession> {
  const sessionId = generateSessionId()

  const response = await fetch(`${FASTAPI_BASE_URL}/apps/${encodeURIComponent(APP_NAME)}/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({}),
    })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Failed to initialize session (${response.status}): ${errorText}`)
  }

  // Best-effort validation of response shape
  try {
    const data: unknown = await response.json()
    const maybeRecord = (data ?? {}) as Record<string, unknown>
    const returnedId = (typeof maybeRecord.id === 'string'
      ? maybeRecord.id
      : typeof maybeRecord.sessionId === 'string'
        ? (maybeRecord.sessionId as string)
        : undefined)
    if (returnedId && returnedId !== sessionId) {
      // Backend returned a different id than we generated; surface as error to avoid mismatch
      throw new Error('Session id mismatch between client and server')
    }
  } catch {
    // If body isn't JSON or shape differs, ignore; success is determined by HTTP 2xx
  }

  return {
    id: sessionId,
    title: 'New Chat',
    timestamp: new Date(),
    messageCount: 0,
  }
}

export async function getChatSessions(): Promise<ChatSession[]> {
  // No list endpoint specified yet; return empty for now
  return []
}

export async function getSessionMessages(_sessionId: string): Promise<Message[]> {
  // No history endpoint specified yet; return empty for now
  return []
}

export async function sendMessage(userId: string, sessionId: string, content: string): Promise<Message> {
  const payload: SendMessageRequest = {
    app_name: APP_NAME,
    user_id: userId,
    session_id: sessionId,
    new_message: {
      parts: [{ text: content }],
      role: 'user',
    },
  }

  let text = ''
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = (await res.json()) as unknown as SendMessageResponse
    const fromMessage = typeof data.message === 'string' ? data.message : undefined
    const fromContent = typeof data.content === 'string' ? data.content : undefined
    const fromParts = Array.isArray(data.parts) && data.parts.length > 0 && typeof data.parts[0]?.text === 'string' ? data.parts[0]?.text : undefined
    text = fromMessage ?? fromContent ?? fromParts ?? ''
    if (!text) {
      text = 'Received a response from the AI backend, but could not parse a text answer.'
    }
  } catch (error) {
    text = `Backend error: ${error instanceof Error ? error.message : 'Unknown error'}`
  }

  return {
    id: `msg_${Date.now()}`,
    content: text,
    role: 'assistant',
    timestamp: new Date(),
  }
}

export async function deleteSession(_sessionId: string): Promise<void> {
  // No delete endpoint specified yet
}

export async function updateSessionTitle(_sessionId: string, _title: string): Promise<void> {
  // No rename endpoint specified yet
}
