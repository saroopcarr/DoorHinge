// src/pages/auth/profile.tsx
// Purpose: Complete user profile after signup
// Different forms for Owner vs Seeker

import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ProfileSetup() {
  const router = useRouter()
  const { role } = router.query
  const [loading, setLoading] = useState(false)

  const [ownerForm, setOwnerForm] = useState({
    businessName: '',
    bio: '',
  })

  const [seekerForm, setSeekerForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'MALE',
    employmentStatus: 'EMPLOYED',
    rentPurpose: 'BACHELORS',
    allowedGenders: [] as string[],
    occupantCount: '1',
    maxBudget: '',
    preferredAreas: '',
    moveInDate: '',
    bio: '',
  })

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/api/profiles/update', ownerForm, {
        withCredentials: true,
      })
      toast.success('Profile created!')
      router.push('/owner/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSeekerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(
        '/api/profiles/update',
        {
          ...seekerForm,
          age: parseInt(seekerForm.age),
          occupantCount: seekerForm.occupantCount
            ? parseInt(seekerForm.occupantCount)
            : undefined,
          maxBudget: parseInt(seekerForm.maxBudget),
          preferredAreas: seekerForm.preferredAreas.split(',').map(a => a.trim()),
          moveInDate: new Date(seekerForm.moveInDate).toISOString(),
        },
        { withCredentials: true }
      )
      toast.success('Profile created!')
      router.push('/seeker/swipe')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8">Complete Your Profile</h1>

        {role === 'OWNER' ? (
          <form onSubmit={handleOwnerSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Business Name (Optional)
              </label>
              <input
                type="text"
                className="input"
                value={ownerForm.businessName}
                onChange={(e) =>
                  setOwnerForm({ ...ownerForm, businessName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                className="input"
                rows={4}
                value={ownerForm.bio}
                onChange={(e) =>
                  setOwnerForm({ ...ownerForm, bio: e.target.value })
                }
              />
            </div>

            <button type="submit" disabled={loading} className="btn w-full">
              {loading ? 'Creating...' : 'Complete Profile'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSeekerSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  className="input"
                  value={seekerForm.firstName}
                  onChange={(e) =>
                    setSeekerForm({ ...seekerForm, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  className="input"
                  value={seekerForm.lastName}
                  onChange={(e) =>
                    setSeekerForm({ ...seekerForm, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  type="number"
                  className="input"
                  min="18"
                  max="120"
                  value={seekerForm.age}
                  onChange={(e) =>
                    setSeekerForm({ ...seekerForm, age: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  className="input"
                  value={seekerForm.gender}
                  onChange={(e) =>
                    setSeekerForm({ ...seekerForm, gender: e.target.value })
                  }
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Employment Status
                </label>
                <select
                  className="input"
                  value={seekerForm.employmentStatus}
                  onChange={(e) =>
                    setSeekerForm({
                      ...seekerForm,
                      employmentStatus: e.target.value,
                    })
                  }
                >
                  <option value="STUDENT">Student</option>
                  <option value="EMPLOYED">Employed</option>
                  <option value="SELF_EMPLOYED">Self-Employed</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rent Purpose
                </label>
                <select
                  className="input"
                  value={seekerForm.rentPurpose}
                  onChange={(e) =>
                    setSeekerForm({
                      ...seekerForm,
                      rentPurpose: e.target.value,
                    })
                  }
                >
                  <option value="BACHELORS">Bachelors</option>
                  <option value="FAMILY">Family</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Max Budget (Monthly Rent)
              </label>
              <input
                type="number"
                className="input"
                value={seekerForm.maxBudget}
                onChange={(e) =>
                  setSeekerForm({ ...seekerForm, maxBudget: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Preferred Areas (comma-separated)
              </label>
              <input
                type="text"
                className="input"
                placeholder="Downtown, Business District"
                value={seekerForm.preferredAreas}
                onChange={(e) =>
                  setSeekerForm({
                    ...seekerForm,
                    preferredAreas: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Move-in Date
              </label>
              <input
                type="date"
                className="input"
                value={seekerForm.moveInDate}
                onChange={(e) =>
                  setSeekerForm({ ...seekerForm, moveInDate: e.target.value })
                }
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn w-full">
              {loading ? 'Creating...' : 'Complete Profile'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
