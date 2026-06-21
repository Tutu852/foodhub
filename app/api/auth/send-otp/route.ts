import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { User } from '@/lib/models/User'
import { OTP } from '@/lib/models/OTP'
import otpGenerator from 'otp-generator'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Ensure database is connected
    await connectToDatabase()

    // Check if user is already registered
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User is already registered' },
        { status: 400 }
      )
    }

    // Generate a 6-digit numeric OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })

    // Ensure OTP uniqueness (just in case)
    let otpExists = await OTP.findOne({ otp })
    while (otpExists) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
      otpExists = await OTP.findOne({ otp })
    }

    // Save to database (this triggers the Mongoose pre-save hook that dispatches the email)
    await OTP.create({ email, otp })

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    })
  } catch (error: any) {
    console.error('Error in send-otp API route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
