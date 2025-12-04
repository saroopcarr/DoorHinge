// src/pages/seeker/matches.tsx
// Purpose: Show seeker's matches
// Lists properties they matched with and allows messaging

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Match {
  id: string
  property: {
    title: string
    area: string
    photos: { url: string }[]
  }
  messages: { id: string }[]
}

export default function SeekerMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const res = await axios.get('/api/matches', { withCredentials: true })
      setMatches(res.data.matches)
    } catch (error) {
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Matches</h1>
          <Link href="/seeker/swipe" className="btn">
            ← Back to Swiping
          </Link>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No matches yet. Keep swiping!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div key={match.id} className="card overflow-hidden">
                {match.property.photos[0] && (
                  <img
                    src={match.property.photos[0].url}
                    alt={match.property.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{match.property.title}</h3>
                  <p className="text-gray-600 text-sm">{match.property.area}</p>
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/matches/${match.id}/chat`}
                      className="flex-1 btn text-center"
                    >
                      Chat
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
