// src/pages/api/auth/login.ts
// Purpose: User login endpoint
// Validates credentials and returns JWT tokens

import { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'
import { prisma } from '@/lib/db'
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from '@/lib/auth'
import { LoginSchema } from '@/lib/validation'
import { withErrorHandler, ApiError } from '@/middleware/error'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Validate input
    const validation = LoginSchema.safeParse(req.body)
    if (!validation.success) {
      throw new ApiError(400, 'Invalid email or password')
    }

    const { email, password } = validation.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { ownerProfile: true, seekerProfile: true },
    })

    if (!user) {
      throw new ApiError(401, 'Invalid email or password')
    }

    // Verify password
    const passwordValid = await comparePassword(password, user.passwordHash)
    if (!passwordValid) {
      throw new ApiError(401, 'Invalid email or password')
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = generateRefreshToken(user.id)

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown',
        userAgent: (req.headers['user-agent'] as string) || 'unknown',
      },
    })

    // Set HTTP-only cookies (secure against XSS)
    res.setHeader('Set-Cookie', [
      cookie.serialize('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 15 * 60, // 15 minutes
      }),
      cookie.serialize('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      }),
    ])

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileComplete:
          user.role === 'OWNER'
            ? user.ownerProfile?.isProfileComplete
            : user.seekerProfile?.isProfileComplete,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export default withErrorHandler(handler)
