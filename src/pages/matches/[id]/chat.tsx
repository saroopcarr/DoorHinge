// src/pages/matches/[id]/chat.tsx
// Purpose: Real-time chat interface for a match
// Shows message history and allows sending new messages

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: { email: string }
}

export default function Chat() {
  const router = useRouter()
  const { id: matchId } = router.query
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    if (!matchId) return
    fetchMessages()
    // Get current user ID
    const id = localStorage.getItem('userId')
    if (id) setUserId(id)
  }, [matchId])

  const fetchMessages = async () => {
    if (!matchId) return
    try {
      const res = await axios.get(`/api/messages?matchId=${matchId}`, {
        withCredentials: true,
      })
      setMessages(res.data.messages)
    } catch (error) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !matchId) return

    const tempInput = input
    setInput('')

    try {
      const res = await axios.post(
        '/api/messages/send',
        { content: tempInput, matchId },
        { withCredentials: true }
      )
      setMessages([...messages, res.data])
    } catch (error: any) {
      setInput(tempInput)
      toast.error(error.response?.data?.error || 'Failed to send message')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat</h1>
        <button onClick={() => router.back()} className="text-white">
          ← Back
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === userId
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input flex-1"
          />
          <button type="submit" className="btn">
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
