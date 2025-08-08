import { type ChatSession, type Message, type SendMessageRequest } from '~/types/chat'

// Backend response types (narrow, only what we use)
interface BackendSessionListItem {
  id?: string
  appName?: string
  userId?: string
  state?: unknown
  events?: unknown[]
  lastUpdateTime?: number
}

interface BackendFunctionCallPart {
  id?: string
  name?: string
  args?: unknown
}

interface BackendFunctionResponsePart {
  id?: string
  name?: string
  response?: unknown
}

interface BackendContentPart {
  text?: string
  functionCall?: BackendFunctionCallPart
  functionResponse?: BackendFunctionResponsePart
}

interface BackendEventContent {
  parts?: BackendContentPart[]
  role?: string
}

interface BackendSessionEvent {
  content?: BackendEventContent
  invocationId?: string
  author?: string
  id?: string
  timestamp?: number
}

interface BackendSessionDetail {
  id?: string
  appName?: string
  userId?: string
  state?: unknown
  events?: BackendSessionEvent[]
  lastUpdateTime?: number
}

const FASTAPI_BASE_URL: string = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL ?? 'http://0.0.0.0:8080'
const APP_NAME: string = process.env.NEXT_PUBLIC_APP_NAME ?? 'agent'

function generateSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback
  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export async function createNewSession(userId: string): Promise<ChatSession> {
  const sessionId = generateSessionId()

  const response = await fetch(`${FASTAPI_BASE_URL}/apps/${APP_NAME}/users/${(userId)}/sessions/${(sessionId)}`,
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
    let returnedId: string | undefined
    if (typeof maybeRecord.id === 'string') returnedId = maybeRecord.id
    else if (typeof maybeRecord.sessionId === 'string') returnedId = maybeRecord.sessionId as unknown as string
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

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  try {
    const response = await fetch(
      `${FASTAPI_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`Failed to fetch sessions (${response.status}): ${errorText}`)
    }

    const data: unknown = await response.json()

    if (!Array.isArray(data)) return []

    console.log("sesssioons : ",data)


    const sessions: ChatSession[] = (data as BackendSessionListItem[]).map((item): ChatSession => {
      const id: string = typeof item.id === 'string' ? item.id : `session_${Math.random().toString(36).slice(2)}`
      const lastUpdate: number | undefined = typeof item.lastUpdateTime === 'number' ? item.lastUpdateTime : undefined
      const timestamp = new Date((lastUpdate ?? Date.now() / 1000) * 1000)
      return {
        id,
        title: 'Chat',
        timestamp,
        messageCount: 0,
      }
    })

    // Sort by newest first
    sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return sessions
  } catch (error) {
    console.error('Error fetching chat sessions:', error)
    return []
  }
}

export async function getSessionMessages(userId: string, sessionId: string): Promise<Message[]> {
  try {
    const response = await fetch(
      `${FASTAPI_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`Failed to fetch session messages (${response.status}): ${errorText}`)
    }

    const data: unknown = await response.json()

    const detail: BackendSessionDetail | null =
      typeof data === 'object' && data !== null ? (data as BackendSessionDetail) : null
    if (!detail || !Array.isArray(detail.events)) return []

    const messages: Message[] = []
    for (const evt of detail.events) {
      const contentObj = evt?.content
      const parts: BackendContentPart[] = Array.isArray(contentObj?.parts)
        ? contentObj.parts
        : []
      const roleFromContent = contentObj?.role
      const author = evt?.author
      const role: 'user' | 'assistant' = roleFromContent === 'user' || author === 'user' ? 'user' : 'assistant'

      const texts: string[] = []
      for (const p of parts) {
        if (typeof p?.text === 'string') {
          texts.push(p.text)
        }
      }
      const content = texts.join('')
      if (!content) continue

      const id: string = typeof evt?.id === 'string' ? evt.id : `${role}_${Math.random().toString(36).slice(2)}`
      const tsNum: number | undefined = typeof evt?.timestamp === 'number' ? evt.timestamp : undefined
      const timestamp = new Date((tsNum ?? Date.now() / 1000) * 1000)

      messages.push({ id, content, role, timestamp })
    }

    return messages
  } catch (error) {
    console.error('Error fetching session messages:', error)
    return []
  }
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

  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      throw new Error(`Failed to send message (${res.status}): ${errorText}`)
    }

    const raw: unknown = await res.json()

    // Narrowing helpers
    const isRecord = (val: unknown): val is Record<string, unknown> =>
      typeof val === 'object' && val !== null

    const extractTextFromRunResponse = (data: unknown): string => {
      // Case 1: Array of events/objects with content.parts[].text
      if (Array.isArray(data)) {
        const collected: string[] = []
        for (const item of data) {
          if (!isRecord(item)) continue
          const contentVal = item.content
          if (isRecord(contentVal)) {
            const partsVal = contentVal.parts
            if (Array.isArray(partsVal)) {
              for (const part of partsVal) {
                if (isRecord(part) && typeof part.text === 'string') {
                  collected.push(part.text)
                }
              }
            }
          }
        }
        if (collected.length > 0) return collected.join('')
      }

      // Case 2: Object with message/content fields or parts at top-level
      if (isRecord(data)) {
        if (typeof data.message === 'string') return data.message
        if (typeof data.content === 'string') return data.content

        const contentVal = data.content
        if (isRecord(contentVal)) {
          const partsVal = contentVal.parts
          if (Array.isArray(partsVal)) {
            const texts = partsVal
              .map((p) => (isRecord(p) && typeof p.text === 'string' ? p.text : ''))
              .filter((t): t is string => t.length > 0)
            if (texts.length > 0) return texts.join('')
          }
        }
        const partsTopLevel = data.parts
        if (Array.isArray(partsTopLevel)) {
          const texts = partsTopLevel
            .map((p) => (isRecord(p) && typeof p.text === 'string' ? p.text : ''))
            .filter((t): t is string => t.length > 0)
          if (texts.length > 0) return texts.join('')
        }
      }

      return ''
    }

    const assistantText = extractTextFromRunResponse(raw)

    return {
      id: `assistant_${Date.now()}`,
      content: assistantText || '[empty response] ',
      role: 'assistant',
      timestamp: new Date(),
    }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export async function deleteSession(_sessionId: string): Promise<void> {
  // No delete endpoint specified yet
}

export async function updateSessionTitle(_sessionId: string, _title: string): Promise<void> {
  // No rename endpoint specified yet
}
