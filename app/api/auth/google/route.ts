import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID is not configured in .env.local')
      return NextResponse.json(
        { error: 'Google client ID is not configured' },
        { status: 500 }
      )
    }

    const redirectUri = `${appUrl}/api/auth/callback/google`

    // Generate a secure random state to protect against CSRF attacks
    const state = crypto.randomBytes(16).toString('hex')

    // Store state in HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900, // 15 minutes
      path: '/',
    })

    // Construct Google authorization URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20email%20profile&state=${state}&prompt=select_account`

    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    console.error('Error in google redirect route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
