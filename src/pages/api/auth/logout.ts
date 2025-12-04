// src/pages/api/auth/logout.ts
// Purpose: User logout endpoint
// Clears cookies and invalidates session

import { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'
import { withAuth } from '@/middleware/auth'
import { prisma } from '@/lib/db'

async function handler(req: any, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Invalidate all sessions
  if (req.user) {
    await prisma.session.deleteMany({
      where: { userId: req.user.id },
    })
  }

  // Clear cookies
  res.setHeader('Set-Cookie', [
    cookie.serialize('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    }),
    cookie.serialize('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    }),
  ])

  res.status(200).json({ message: 'Logged out successfully' })
}

export default withAuth(handler)
