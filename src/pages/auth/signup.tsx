// src/pages/auth/signup.tsx
// Purpose: User registration page
// Step 1: Email/password/role, Step 2: OTP verification

import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Signup() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'SEEKER' as 'OWNER' | 'SEEKER',
    otp: '',
  })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/api/auth/signup', {
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        phone: form.phone,
        role: form.role,
      })

      toast.success('Check your phone for OTP!')
      setStep(2)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/api/auth/verify-otp', {
        phone: form.phone,
        otp: form.otp,
      })

      toast.success('Phone verified! Please complete your profile.')
      router.push(`/auth/profile?role=${form.role}`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          {step === 1 ? 'Create Account' : 'Verify Phone'}
        </h1>

        {step === 1 ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                className="input"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="input"
                placeholder="+919876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as 'OWNER' | 'SEEKER' })
                }
              >
                <option value="SEEKER">I'm a Seeker (Looking for property)</option>
                <option value="OWNER">I'm an Owner (Listing property)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn w-full"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have account?{' '}
              <a href="/auth/login" className="text-primary font-semibold">
                Login
              </a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="space-y-4">
            <p className="text-gray-600 text-sm mb-4">
              Enter the 6-digit OTP sent to {form.phone}
            </p>

            <div>
              <label className="block text-sm font-medium mb-2">OTP</label>
              <input
                type="text"
                maxLength={6}
                className="input text-center text-2xl tracking-widest"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || form.otp.length !== 6}
              className="btn w-full"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-outline w-full"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
