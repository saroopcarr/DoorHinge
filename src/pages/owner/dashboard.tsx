// src/pages/owner/dashboard.tsx
// Purpose: Owner dashboard
// Shows their listings and potential seekers who liked them

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Property {
  id: string
  title: string
  area: string
  rentAmount: number
  _count: { likes: number }
}

export default function OwnerDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      // Get owner's properties from their profile
      const res = await axios.get('/api/owner/properties', {
        withCredentials: true,
      })
      setProperties(res.data.properties || [])
    } catch (error) {
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Listings</h1>
          <div className="flex gap-4">
            <Link href="/owner/listings/new" className="btn">
              + Add Property
            </Link>
            <Link href="/owner/likes" className="btn-secondary">
              Who Liked You
            </Link>
            <Link href="/matches" className="btn-secondary">
              Matches
            </Link>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-xl text-gray-600 mb-4">
              No properties listed yet
            </p>
            <Link href="/owner/listings/new" className="btn">
              Create First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="card p-6">
                <h3 className="font-bold text-lg mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-2">{property.area}</p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Rent</p>
                    <p className="text-2xl font-bold">₹{property.rentAmount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Likes</p>
                    <p className="text-2xl font-bold">{property._count.likes}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/owner/listings/${property.id}/edit`}
                    className="flex-1 btn text-center text-sm"
                  >
                    Edit
                  </Link>
                  <button className="flex-1 btn-outline text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
