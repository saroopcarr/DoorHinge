// src/pages/api/auth/signup.ts
// Purpose: User registration endpoint
// Validates input, creates user, generates OTP

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import {
  hashPassword,
  validatePasswordStrength,
} from '@/lib/auth'
import { SignupSchema } from '@/lib/validation'
import { generateOtp, smsProvider } from '@/lib/sms'
import { withErrorHandler, ApiError } from '@/middleware/error'
import { authLimiter } from '@/lib/rateLimit'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Apply rate limiting
  try {
    await new Promise<void>((resolve, reject) => {
      authLimiter(req as any, res as any, (err: any) => (err ? reject(err) : resolve()))
    })
  } catch (error) {
    return res.status(429).json({ error: 'Too many signup attempts, please try again later' })
  }

  // Validate input
  const validation = SignupSchema.safeParse(req.body)
  if (!validation.success) {
    throw new ApiError(400, 'Validation failed', validation.error.flatten())
  }

  const { email, password, phone, role } = validation.data

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  })

  if (existingUser) {
    throw new ApiError(409, 'Email or phone already registered')
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password)
  if (!passwordValidation.isValid) {
    throw new ApiError(400, 'Weak password', {
      errors: passwordValidation.errors,
    })
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      role,
      isVerified: false,
    },
  })

  // Generate and send OTP
  const otp = generateOtp()
  const otpSent = await smsProvider.sendOtp(phone, otp)

  if (!otpSent) {
    // Still allow signup but log the error
    console.error('Failed to send OTP to', phone)
  }

  res.status(201).json({
    message: 'Account created. Please verify your phone number.',
    userId: user.id,
    email: user.email,
  })
}

export default withErrorHandler(handler)
