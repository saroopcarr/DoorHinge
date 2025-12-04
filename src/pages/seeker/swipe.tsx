// src/pages/seeker/swipe.tsx
// Purpose: Main swipe interface for seekers
// Shows property cards with swipe gestures (like/skip)

import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Property {
  id: string
  title: string
  description: string
  area: string
  bedrooms: string
  furnishedStatus: string
  rentAmount: number
  maintenanceAmount: number
  deposit: number
  amenities: string[]
  photos: { url: string }[]
  _count: { likes: number }
}

export default function SeekerSwipe() {
  const [properties, setProperties] = useState<Property[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const res = await axios.get('/api/properties?limit=50')
      setProperties(res.data.properties)
    } catch (error) {
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (currentIndex >= properties.length) return

    try {
      await axios.post(
        '/api/matches/like',
        { propertyId: properties[currentIndex].id },
        { withCredentials: true }
      )
      toast.success('Liked!')
      setCurrentIndex(currentIndex + 1)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to like')
    }
  }

  const handleSkip = () => {
    setCurrentIndex(currentIndex + 1)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  if (currentIndex >= properties.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">No more properties!</h2>
          <p className="text-gray-600 mb-4">Check back later for new listings</p>
          <button
            onClick={() => {
              setCurrentIndex(0)
              fetchProperties()
            }}
            className="btn"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const current = properties[currentIndex]

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">DoorHinge</h1>
          <div className="flex gap-4">
            <a href="/seeker/matches" className="btn">
              Matches
            </a>
            <a href="/logout" className="btn-outline">
              Logout
            </a>
          </div>
        </div>

        {/* Property Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {current.photos.length > 0 && (
            <img
              src={current.photos[0].url}
              alt={current.title}
              className="w-full h-96 object-cover"
            />
          )}

          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">{current.title}</h2>
            <p className="text-gray-600 mb-4">{current.area}</p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm text-gray-600">Rent</p>
                <p className="text-xl font-bold">₹{current.rentAmount}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm text-gray-600">Bedrooms</p>
                <p className="text-xl font-bold">{current.bedrooms}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm text-gray-600">Furnished</p>
                <p className="text-xl font-bold">{current.furnishedStatus}</p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{current.description}</p>

            {current.amenities.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {current.amenities.map((a) => (
                    <span key={a} className="bg-primary text-white px-3 py-1 rounded text-sm">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 p-6 border-t">
            <button
              onClick={handleSkip}
              className="flex-1 btn-outline"
            >
              ✕ Skip
            </button>
            <button
              onClick={handleLike}
              className="flex-1 btn"
            >
              ❤️ Like
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="text-center mt-4 text-gray-600">
          {currentIndex + 1} / {properties.length} properties
        </div>
      </div>
    </div>
  )
}
