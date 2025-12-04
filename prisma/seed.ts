// prisma/seed.ts
// This script populates your database with demo data for testing
// Run with: npm run prisma:seed

const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    // Clean up existing data
    await prisma.message.deleteMany()
    await prisma.match.deleteMany()
    await prisma.like.deleteMany()
    await prisma.media.deleteMany()
    await prisma.property.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.session.deleteMany()
    await prisma.seekerProfile.deleteMany()
    await prisma.ownerProfile.deleteMany()
    await prisma.user.deleteMany()

    console.log('✓ Cleaned up database')

    // Create demo Owner
    const ownerUser = await prisma.user.create({
      data: {
        email: 'owner@example.com',
        phone: '+919876543210',
        passwordHash: await bcryptjs.hash('Password123!', 10),
        role: 'OWNER',
        isVerified: true,
        isPhoneVerified: true,
      },
    })

    const ownerProfile = await prisma.ownerProfile.create({
      data: {
        userId: ownerUser.id,
        businessName: 'Urban Living Solutions',
        bio: 'Premium rental properties in the city center',
        verificationStatus: 'VERIFIED',
        isProfileComplete: true,
      },
    })

    console.log('✓ Created demo Owner:', ownerUser.email)

    // Create demo Properties
    const property1 = await prisma.property.create({
      data: {
        ownerId: ownerProfile.id,
        title: 'Cozy 2-BHK in Downtown',
        description:
          'Beautiful furnished apartment with modern amenities, perfect for young professionals or couples',
        area: 'Downtown Central',
        bedrooms: 'TWO',
        furnishedStatus: 'FURNISHED',
        rentAmount: 25000,
        maintenanceAmount: 2000,
        deposit: 50000,
        amenities: [
          'WiFi',
          'Air Conditioning',
          'Parking',
          'Gym',
          'Swimming Pool',
        ],
        houseRules: ['No smoking', 'Quiet hours after 10 PM', 'No pets'],
        availabilityDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        photos: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
              type: 'IMAGE',
              order: 0,
            },
            {
              url: 'https://images.unsplash.com/photo-1460932945bf968ad4d977f4b98bd40745ab47d8c?w=800',
              type: 'IMAGE',
              order: 1,
            },
          ],
        },
      },
    })

    const property2 = await prisma.property.create({
      data: {
        ownerId: ownerProfile.id,
        title: '3-BHK Family Home',
        description:
          'Spacious family home with attached garden, great for families with kids',
        area: 'Suburban Green Valley',
        bedrooms: 'THREE',
        furnishedStatus: 'SEMI_FURNISHED',
        rentAmount: 40000,
        maintenanceAmount: 3000,
        deposit: 80000,
        amenities: [
          'Garden',
          'Terrace',
          'Parking',
          'Store Room',
          'Balcony',
        ],
        houseRules: ['No loud music', 'Quiet after 9 PM'],
        availabilityDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        photos: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
              type: 'IMAGE',
              order: 0,
            },
          ],
        },
      },
    })

    console.log('✓ Created 2 demo properties')

    // Create demo Seekers
    const seeker1User = await prisma.user.create({
      data: {
        email: 'seeker1@example.com',
        phone: '+919123456789',
        passwordHash: await bcryptjs.hash('Password123!', 10),
        role: 'SEEKER',
        isVerified: true,
        isPhoneVerified: true,
      },
    })

    const seeker1Profile = await prisma.seekerProfile.create({
      data: {
        userId: seeker1User.id,
        firstName: 'Raj',
        lastName: 'Kumar',
        age: 26,
        gender: 'MALE',
        employmentStatus: 'EMPLOYED',
        rentPurpose: 'BACHELORS',
        allowedGenders: ['FEMALE', 'OTHER'],
        occupantCount: 2,
        maxBudget: 30000,
        preferredAreas: ['Downtown Central', 'Business District'],
        moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        bio: 'Software engineer looking for a comfortable bachelor pad',
        isProfileComplete: true,
      },
    })

    const seeker2User = await prisma.user.create({
      data: {
        email: 'seeker2@example.com',
        phone: '+919987654321',
        passwordHash: await bcryptjs.hash('Password123!', 10),
        role: 'SEEKER',
        isVerified: true,
        isPhoneVerified: true,
      },
    })

    const seeker2Profile = await prisma.seekerProfile.create({
      data: {
        userId: seeker2User.id,
        firstName: 'Priya',
        lastName: 'Singh',
        age: 28,
        gender: 'FEMALE',
        employmentStatus: 'EMPLOYED',
        rentPurpose: 'FAMILY',
        familySize: 3,
        maxBudget: 45000,
        preferredAreas: ['Suburban Green Valley', 'Peaceful Outskirts'],
        moveInDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        bio: 'Looking for a family home with good schools nearby',
        isProfileComplete: true,
      },
    })

    console.log('✓ Created 2 demo seekers')

    // Create demo Likes
    await prisma.like.create({
      data: {
        userId: seeker1User.id,
        propertyId: property1.id,
      },
    })

    await prisma.like.create({
      data: {
        userId: seeker2User.id,
        propertyId: property2.id,
      },
    })

    console.log('✓ Created demo likes')

    // Create demo Match
    const match = await prisma.match.create({
      data: {
        propertyId: property1.id,
        ownerId: ownerUser.id,
        seekerId: seeker1User.id,
      },
    })

    // Add demo messages
    await prisma.message.create({
      data: {
        matchId: match.id,
        senderId: seeker1User.id,
        content: 'Hi! I am very interested in your property. Can we schedule a visit?',
        read: true,
      },
    })

    await prisma.message.create({
      data: {
        matchId: match.id,
        senderId: ownerUser.id,
        content: 'Sure! I am available this weekend. Would that work for you?',
        read: true,
      },
    })

    console.log('✓ Created demo match and messages')

    console.log('\n✅ Database seeded successfully!')
    console.log('\nDemo Credentials:')
    console.log('Owner: owner@example.com / Password123!')
    console.log('Seeker 1: seeker1@example.com / Password123!')
    console.log('Seeker 2: seeker2@example.com / Password123!')
  } catch (e) {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
