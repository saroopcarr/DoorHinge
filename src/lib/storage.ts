// src/lib/storage.ts
// Purpose: Mock file upload management for local development
// Returns placeholder URLs for images/videos

interface UploadResponse {
  url: string
}

class MockStorageProvider {
  /**
   * Mock upload - returns a placeholder URL
   * In production, this would upload to Cloudinary
   */
  async upload(file: File, folder: string): Promise<UploadResponse> {
    // Validate file
    if (file.size > 52428800) {
      throw new Error('File too large (max 50MB)')
    }

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
    ]
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type')
    }

    // Return mock URL
    const mockUrl = `/uploads/${folder}/${Date.now()}-${file.name}`
    console.log(`📤 Mock uploaded: ${mockUrl}`)
    return { url: mockUrl }
  }

  async delete(cloudinaryId: string): Promise<boolean> {
    console.log(`🗑️ Mock deleted: ${cloudinaryId}`)
    return true
  }
}

export const storageProvider = new MockStorageProvider()

/**
 * Generate signed upload URL for direct browser uploads
 * Returns mock URL for local development
 */
export function generateSignedUploadUrl(): string {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/upload/signed`
}