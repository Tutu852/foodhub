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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const clientId = process.env.OUTLOOK_CLIENT_ID
  const clientSecret = process.env.OUTLOOK_CLIENT_SECRET
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common'

  try {
    if (!code) {
      return NextResponse.redirect(`${appUrl}/login?error=Authorization code not received from Outlook`)
    }

    // Verify state to prevent CSRF
    const cookieStore = await cookies()
    const storedState = cookieStore.get('outlook_oauth_state')?.value

    // Clear state cookie
    cookieStore.delete('outlook_oauth_state')

    if (!state || state !== storedState) {
      return NextResponse.redirect(`${appUrl}/login?error=Session state verification failed. Please try again.`)
    }

    if (!clientId || !clientSecret) {
      console.error('Outlook credentials missing in environment variables')
      return NextResponse.redirect(`${appUrl}/login?error=Outlook login is not fully configured on the server`)
    }

    const redirectUri = `${appUrl}/api/auth/callback/outlook`

    // Exchange authorization code for access token
    console.log('Exchanging auth code for Microsoft access token...')
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
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
      console.error('Microsoft token exchange error:', tokenData)
      return NextResponse.redirect(`${appUrl}/login?error=Failed to retrieve access token from Microsoft`)
    }

    const { access_token } = tokenData

    // Fetch user profile info from Microsoft Graph API
    console.log('Fetching user profile from Microsoft Graph...')
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const profileData = await profileResponse.json()
    console.log('==================================================')
    console.log('👤 [MICROSOFT PROFILE DATA RECEIVED]')
    console.log(JSON.stringify(profileData, null, 2))
    console.log('==================================================')

    if (!profileResponse.ok) {
      console.error('Microsoft Graph profile fetch error:', profileData)
      return NextResponse.redirect(`${appUrl}/login?error=Failed to retrieve user profile details from Microsoft`)
    }

    const email = profileData.mail || profileData.userPrincipalName
    if (!email) {
      console.error('No email address returned in Microsoft Graph profile:', profileData)
      return NextResponse.redirect(`${appUrl}/login?error=Your Microsoft account does not expose a valid email address`)
    }

    const displayName = profileData.displayName || 'Outlook User'
    const nameParts = displayName.trim().split(/\s+/)
    const firstName = nameParts[0] || 'Outlook'
    const lastName = nameParts.slice(1).join(' ') || 'User'

    // Connect to database
    await connectToDatabase()

    // Find or create user
    let user = await User.findOne({ email })

    if (user) {
      console.log(`User already exists for email: ${email}. Linking Outlook account...`)
      user.outlookId = profileData.id
      if (user.provider !== 'outlook' && user.provider !== 'credentials') {
        user.provider = 'outlook'
      }
      await user.save()
    } else {
      console.log(`Creating new user account for Outlook sign-in: ${email}`)
      // Create random secure password for database requirement
      const rawPassword = crypto.randomBytes(16).toString('hex')
      const hashedPassword = await hashPassword(rawPassword)

      user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        provider: 'outlook',
        outlookId: profileData.id,
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

    console.log(`Outlook login succeeded for user: ${email}`)
    return NextResponse.redirect(`${appUrl}/`)
  } catch (error: any) {
    console.error('Error in Outlook callback route:', error)
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error.message || 'Internal server error')}`)
  }
}
