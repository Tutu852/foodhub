import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { User } from '@/lib/models/User'
import { mailSender } from '@/lib/mail-sender'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'This email is not registered with us' },
        { status: 401 }
      )
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex')

    // Update user with token and expiration
    await User.findOneAndUpdate(
      { email },
      {
        token: token,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
      },
      { new: true }
    )

    // Construct link
    const origin = request.nextUrl.origin || 'http://localhost:3000'
    const url = `${origin}/reset-password/${token}`

    // Send email
    await mailSender(
      email,
      'FoodHub | Password Reset Link',
      `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #FF385C; text-align: center;">Reset Your Password</h2>
        <p>Dear Customer,</p>
        <p>We received a request to reset your password for your FoodHub account. Please click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #FF385C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #FF385C;">${url}</p>
        <p>This link is valid for <strong>1 hour</strong>. If you did not request a password reset, please ignore this email.</p>
        <p style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888;">
          Best regards,<br>
          The FoodHub Team
        </p>
      </div>
      `
    )

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully, please check your email to reset password.',
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
