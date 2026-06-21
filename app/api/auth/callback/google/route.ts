import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import connectToDatabase from '@/lib/db'
import { User } from '@/lib/models/User'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  try {
    if (!code) {
      return NextResponse.redirect(`${appUrl}/login?error=Authorization code not received from Google`)
    }

    // Verify state to prevent CSRF
    const cookieStore = await cookies()
    const storedState = cookieStore.get('google_oauth_state')?.value

    // Clear state cookie
    cookieStore.delete('google_oauth_state')

    if (!state || state !== storedState) {
      return NextResponse.redirect(`${appUrl}/login?error=Session state verification failed. Please try again.`)
    }

    if (!clientId || !clientSecret) {
      console.error('Google credentials missing in environment variables')
      return NextResponse.redirect(`${appUrl}/login?error=Google login is not fully configured on the server`)
    }

    const redirectUri = `${appUrl}/api/auth/callback/google`

    // Exchange authorization code for access token
    console.log('Exchanging auth code for Google access token...')
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error('Google token exchange error:', tokenData)
      return NextResponse.redirect(`${appUrl}/login?error=Failed to retrieve access token from Google`)
    }

    const { access_token } = tokenData

    // Fetch user profile info from Google UserInfo API
    console.log('Fetching user profile from Google UserInfo...')
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const profileData = await profileResponse.json()
    console.log('==================================================')
    console.log('👤 [GOOGLE PROFILE DATA RECEIVED]')
    console.log(JSON.stringify(profileData, null, 2))
    console.log('==================================================')

    if (!profileResponse.ok) {
      console.error('Google profile fetch error:', profileData)
      return NextResponse.redirect(`${appUrl}/login?error=Failed to retrieve user profile details from Google`)
    }

    const email = profileData.email
    if (!email) {
      console.error('No email address returned in Google profile:', profileData)
      return NextResponse.redirect(`${appUrl}/login?error=Your Google account does not expose a valid email address`)
    }

    const firstName = profileData.given_name || 'Google'
    const lastName = profileData.family_name || 'User'

    // Connect to database
    await connectToDatabase()

    // Find or create user
    let user = await User.findOne({ email })

    if (user) {
      console.log(`User already exists for email: ${email}. Linking Google account...`)
      user.googleId = profileData.sub
      if (user.provider !== 'google' && user.provider !== 'credentials') {
        user.provider = 'google'
      }
      await user.save()
    } else {
      console.log(`Creating new user account for Google sign-in: ${email}`)
      // Create random secure password for database requirement
      const rawPassword = crypto.randomBytes(16).toString('hex')
      const hashedPassword = await hashPassword(rawPassword)

      user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        provider: 'google',
        googleId: profileData.sub,
        accountType: 'Customer',
        active: true,
        approved: true,
      })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      accountType: user.accountType,
    })

    // Store token in user document
    user.token = token
    await user.save()

    // Set auth cookie
    await setAuthCookie(token)

    console.log(`Google login succeeded for user: ${email}`)
    return NextResponse.redirect(`${appUrl}/`)
  } catch (error: any) {
    console.error('Error in Google callback route:', error)
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error.message || 'Internal server error')}`)
  }
}
