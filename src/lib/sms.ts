// src/lib/sms.ts
// Purpose: Mock SMS OTP provider for local development
// OTP is sent via console for 2FA phone verification

import crypto from 'crypto'

interface SmsProvider {
  sendOtp(phone: string, otp: string): Promise<boolean>
  verifyOtp(phone: string, otp: string): Promise<boolean>
}

// Store OTPs in memory (dev only - use Redis in production)
const otpStorage: Map<string, { otp: string; expiresAt: number }> = new Map()

class MockSmsProvider implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    // Store OTP for 10 minutes
    const expiresAt = Date.now() + 10 * 60 * 1000
    otpStorage.set(phone, { otp, expiresAt })

    console.log(
      `\n📱 Mock SMS to ${phone}:\n🔐 Your OTP is: ${otp}\n(Valid for 10 minutes)\n`
    )
    return true
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const stored = otpStorage.get(phone)
    if (!stored) return false
    if (Date.now() > stored.expiresAt) {
      otpStorage.delete(phone)
      return false
    }
    if (stored.otp !== otp) return false
    otpStorage.delete(phone)
    return true
  }
}

// Use mock SMS provider
export const smsProvider: SmsProvider = new MockSmsProvider()

/**
 * Generate a random 6-digit OTP
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString()
}
