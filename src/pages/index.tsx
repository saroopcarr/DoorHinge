// src/pages/index.tsx
// Purpose: Landing page - Hinge-inspired design
// Shows auth options or dashboard based on login status

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'
import { Heart, Home as HomeIcon, MessageSquare, Zap } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { isLoggedIn, user } = useAuthStore()

  useEffect(() => {
    if (isLoggedIn && user?.profileComplete) {
      router.push(user.role === 'OWNER' ? '/owner/dashboard' : '/seeker/swipe')
    }
  }, [isLoggedIn, user, router])

  const navStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #f0f0f0',
    zIndex: 50,
  }

  const navContainerStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 16px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const logoTextStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000',
  }

  const navLinksStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
  }

  const signInLinkStyle: React.CSSProperties = {
    padding: '8px 24px',
    color: '#666',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'color 0.3s',
  }

  const ctaButtonStyle: React.CSSProperties = {
    padding: '8px 24px',
    backgroundColor: '#ec4899',
    color: 'white',
    fontWeight: '600',
    borderRadius: '9999px',
    cursor: 'pointer',
    textDecoration: 'none',
    boxShadow: '0 10px 25px rgba(236, 72, 153, 0.2)',
    transition: 'all 0.3s',
    display: 'inline-block',
    border: 'none',
  }

  const heroStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '80px 16px 128px',
  }

  const heroGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    alignItems: 'center',
  }

  const heroContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  }

  const heroHeadingStyle: React.CSSProperties = {
    fontSize: '56px',
    fontWeight: 'bold',
    lineHeight: '1.2',
    color: '#000',
    marginBottom: '16px',
  }

  const heroPinkStyle: React.CSSProperties = {
    color: '#ec4899',
  }

  const heroDescStyle: React.CSSProperties = {
    fontSize: '20px',
    color: '#666',
    lineHeight: '1.6',
  }

  const heroButtonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
  }

  const primaryButtonStyle: React.CSSProperties = {
    ...ctaButtonStyle,
    padding: '12px 32px',
    fontSize: '16px',
  }

  const secondaryButtonStyle: React.CSSProperties = {
    padding: '12px 32px',
    border: '2px solid #ddd',
    color: '#000',
    fontWeight: 'bold',
    borderRadius: '9999px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s',
    backgroundColor: 'transparent',
  }

  const illustrationStyle: React.CSSProperties = {
    position: 'relative',
    height: '384px',
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
  }

  const propertyImageStyle: React.CSSProperties = {
    width: '128px',
    height: '160px',
    background: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)',
    borderRadius: '12px',
    margin: '0 auto 16px',
  }

  const featuresContainerStyle: React.CSSProperties = {
    backgroundColor: '#f9fafb',
    padding: '80px 16px',
  }

  const featuresSectionStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
  }

  const featuresHeaderStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '64px',
  }

  const featuresHeadingStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#000',
    marginBottom: '16px',
  }

  const featuresSubStyle: React.CSSProperties = {
    fontSize: '18px',
    color: '#666',
  }

  const featureGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '32px',
  }

  const featureCardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '16px',
    textAlign: 'center',
    transition: 'box-shadow 0.3s',
    cursor: 'pointer',
  }

  const featureCardTitle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#000',
    marginBottom: '8px',
    marginTop: '16px',
  }

  const featureCardDesc: React.CSSProperties = {
    color: '#666',
  }

  const ctaSectionStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '80px 16px',
  }

  const ctaBoxStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    borderRadius: '24px',
    padding: '48px',
    textAlign: 'center',
    color: 'white',
  }

  const ctaHeadingStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '16px',
  }

  const ctaParagraphStyle: React.CSSProperties = {
    fontSize: '18px',
    marginBottom: '32px',
    opacity: 0.9,
  }

  const ctaFinalButtonStyle: React.CSSProperties = {
    backgroundColor: 'white',
    color: '#ec4899',
    padding: '12px 32px',
    fontWeight: 'bold',
    borderRadius: '9999px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    border: 'none',
    transition: 'all 0.3s',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  }

  const footerStyle: React.CSSProperties = {
    backgroundColor: '#111',
    color: '#999',
    padding: '48px 16px',
    borderTop: '1px solid #333',
  }

  const footerContainerStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const footerLogoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const footerTextStyle: React.CSSProperties = {
    color: 'white',
    fontWeight: 'bold',
  }

  const footerCopyStyle: React.CSSProperties = {
    fontSize: '14px',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Navigation */}
      <nav style={navStyle}>
        <div style={navContainerStyle}>
          <div style={logoStyle}>
            <HomeIcon size={32} color="#ec4899" />
            <span style={logoTextStyle}>DoorHinge</span>
          </div>
          {!isLoggedIn ? (
            <div style={navLinksStyle}>
              <Link href="/auth/login" style={signInLinkStyle}>
                Sign In
              </Link>
              <Link href="/auth/signup" style={ctaButtonStyle}>
                Get Started
              </Link>
            </div>
          ) : (
            <Link
              href={user?.role === 'OWNER' ? '/owner/dashboard' : '/seeker/swipe'}
              style={ctaButtonStyle}
            >
              Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={heroGridStyle}>
          {/* Left Content */}
          <div style={heroContentStyle}>
            <div>
              <h1 style={heroHeadingStyle}>
                Find your <span style={heroPinkStyle}>perfect</span> rental home
              </h1>
              <p style={heroDescStyle}>
                DoorHinge is the dating app for rental homes. Swipe, like, and match with properties that fit your lifestyle.
              </p>
            </div>

            {!isLoggedIn ? (
              <div style={heroButtonsStyle}>
                <Link href="/auth/signup" style={primaryButtonStyle}>
                  Start Matching
                </Link>
                <Link href="/auth/login" style={secondaryButtonStyle}>
                  Sign In
                </Link>
              </div>
            ) : (
              <Link
                href={user?.role === 'OWNER' ? '/owner/dashboard' : '/seeker/swipe'}
                style={primaryButtonStyle}
              >
                Go to App
              </Link>
            )}
          </div>

          {/* Right Illustration */}
          <div style={illustrationStyle}>
            <div style={cardStyle}>
              <div style={propertyImageStyle}></div>
              <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Modern 2BHK</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>$800/month</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <button
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#fce7f3',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    transition: 'background-color 0.3s',
                  }}
                >
                  ✕
                </button>
                <button
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#ec4899',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 25px rgba(236, 72, 153, 0.2)',
                    transition: 'all 0.3s',
                  }}
                >
                  <Heart size={24} color="white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={featuresContainerStyle}>
        <div style={featuresSectionStyle}>
          <div style={featuresHeaderStyle}>
            <h2 style={featuresHeadingStyle}>How It Works</h2>
            <p style={featuresSubStyle}>The easiest way to find your next home</p>
          </div>

          <div style={featureGridStyle}>
            {[
              {
                icon: <HomeIcon size={32} color="#ec4899" />,
                title: 'Create Profile',
                desc: "Tell us what you're looking for",
              },
              {
                icon: <Zap size={32} color="#ec4899" />,
                title: 'Swipe Away',
                desc: 'Discover properties at your pace',
              },
              {
                icon: <Heart size={32} color="#ec4899" />,
                title: 'Make a Match',
                desc: 'When someone likes you back',
              },
              {
                icon: <MessageSquare size={32} color="#ec4899" />,
                title: 'Chat & Visit',
                desc: 'Connect and schedule viewings',
              },
            ].map((feature, i) => (
              <div key={i} style={featureCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>{feature.icon}</div>
                <h3 style={featureCardTitle}>{feature.title}</h3>
                <p style={featureCardDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={ctaSectionStyle}>
        <div style={ctaBoxStyle}>
          <h2 style={ctaHeadingStyle}>Ready to find your home?</h2>
          <p style={ctaParagraphStyle}>Join thousands of renters finding their perfect match</p>
          <Link
            href={isLoggedIn ? (user?.role === 'OWNER' ? '/owner/dashboard' : '/seeker/swipe') : '/auth/signup'}
            style={ctaFinalButtonStyle}
          >
            {isLoggedIn ? 'Go to App' : 'Get Started Now'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={footerContainerStyle}>
          <div style={footerLogoStyle}>
            <HomeIcon size={24} color="#ec4899" />
            <span style={footerTextStyle}>DoorHinge</span>
          </div>
          <p style={footerCopyStyle}>© 2025 DoorHinge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
