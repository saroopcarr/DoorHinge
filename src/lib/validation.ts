// src/lib/validation.ts
// Purpose: Input validation schemas using Zod
// Ensures type-safe request validation before database operations

import { z } from 'zod'

// Auth Schemas
export const SignupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain number')
      .regex(/[!@#$%^&*]/, 'Must contain special character'),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    role: z.enum(['OWNER', 'SEEKER']),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export const OtpVerificationSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

// Profile Schemas
export const OwnerProfileSchema = z.object({
  businessName: z.string().optional(),
  bio: z.string().max(500).optional(),
})

export const SeekerProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  age: z.number().int().min(18).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  employmentStatus: z.enum([
    'STUDENT',
    'EMPLOYED',
    'SELF_EMPLOYED',
    'UNEMPLOYED',
    'RETIRED',
  ]),
  rentPurpose: z.enum(['BACHELORS', 'FAMILY']),
  allowedGenders: z.array(z.enum(['MALE', 'FEMALE', 'OTHER'])).optional(),
  occupantCount: z.number().int().min(1).max(10).optional(),
  familySize: z.number().int().min(1).max(20).optional(),
  maxBudget: z.number().int().min(1000).max(10000000),
  preferredAreas: z.array(z.string()).min(1),
  moveInDate: z.string().datetime(),
  bio: z.string().max(500).optional(),
})

// Property Schemas
export const PropertyCreateSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  area: z.string().min(2).max(100),
  bedrooms: z.enum([
    'STUDIO',
    'ONE',
    'TWO',
    'THREE',
    'FOUR',
    'FOUR_PLUS',
  ]),
  furnishedStatus: z.enum(['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']),
  rentAmount: z.number().int().min(100).max(10000000),
  maintenanceAmount: z.number().int().min(0).max(1000000),
  deposit: z.number().int().min(0).max(20000000),
  amenities: z.array(z.string()).optional(),
  houseRules: z.array(z.string()).optional(),
  availabilityDate: z.string().datetime(),
})

export const PropertyUpdateSchema = PropertyCreateSchema.partial()

// Message Schema
export const MessageSchema = z.object({
  content: z.string().min(1).max(5000),
  matchId: z.string().uuid(),
})

// Export types inferred from schemas
export type SignupInput = z.infer<typeof SignupSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type OtpVerificationInput = z.infer<typeof OtpVerificationSchema>
export type SeekerProfileInput = z.infer<typeof SeekerProfileSchema>
export type OwnerProfileInput = z.infer<typeof OwnerProfileSchema>
export type PropertyCreateInput = z.infer<typeof PropertyCreateSchema>
export type MessageInput = z.infer<typeof MessageSchema>
