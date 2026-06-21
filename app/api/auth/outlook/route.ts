import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.OUTLOOK_CLIENT_ID
    const tenantId = process.env.OUTLOOK_TENANT_ID || 'common'
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

    if (!clientId) {
      console.error('OUTLOOK_CLIENT_ID is not configured in .env.local')
      return NextResponse.json(
        { error: 'Outlook client ID is not configured' },
        { status: 500 }
      )
    }

    const redirectUri = `${appUrl}/api/auth/callback/outlook`

    // Generate a secure random state to protect against CSRF attacks
    const state = crypto.randomBytes(16).toString('hex')

    // Store state in HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('outlook_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900, // 15 minutes is plenty
      path: '/',
    })

    // Construct Microsoft authorization URL with prompt=select_account to force account selection
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_mode=query&scope=openid%20email%20profile%20User.Read&state=${state}&prompt=select_account`

    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    console.error('Error in outlook redirect route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
