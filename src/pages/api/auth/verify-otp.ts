// src/pages/api/auth/verify-otp.ts
// Purpose: Verify OTP sent via SMS
// Marks user as phone verified after successful OTP verification

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { OtpVerificationSchema } from '@/lib/validation'
import { smsProvider } from '@/lib/sms'
import { withErrorHandler, ApiError } from '@/middleware/error'
import { otpLimiter } from '@/lib/rateLimit'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Apply rate limiting
  try {
    await new Promise<void>((resolve, reject) => {
      otpLimiter(req as any, res as any, (err: any) => (err ? reject(err) : resolve()))
    })
  } catch (error) {
    return res.status(429).json({ error: 'Too many OTP verification attempts, please try again later' })
  }

  // Validate input
  const validation = OtpVerificationSchema.safeParse(req.body)
  if (!validation.success) {
    throw new ApiError(400, 'Invalid phone or OTP format')
  }

  const { phone, otp } = validation.data

  // Verify OTP with provider
  const isValid = await smsProvider.verifyOtp(phone, otp)
  if (!isValid) {
    throw new ApiError(401, 'Invalid or expired OTP')
  }

  // Find and update user
  const user = await prisma.user.findUnique({
    where: { phone },
  })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  // Mark user as verified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isPhoneVerified: true,
      isVerified: true,
    },
  })

  res.status(200).json({
    message: 'Phone number verified successfully',
    userId: user.id,
  })
}

export default withErrorHandler(handler)
