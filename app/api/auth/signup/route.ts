import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { User } from '@/lib/models/User'
import { OTP } from '@/lib/models/OTP'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, otp } = signupSchema.parse(body)

    // Ensure database is connected
    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Verify OTP
    const latestOtpResponse = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
    if (latestOtpResponse.length === 0) {
      return NextResponse.json(
        { error: 'OTP expired or not found. Please send a new OTP.' },
        { status: 400 }
      )
    }
    
    if (otp !== latestOtpResponse[0].otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Split name into firstName and lastName
    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts[0] || 'User'
    const lastName = nameParts.slice(1).join(' ') || 'Name'

    // Create user in MongoDB using Mongoose model
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: 'Customer',
      favorites: [],
      orders: [],
    })

    const userId = user._id.toString()
    const token = generateToken({
      userId,
      email: user.email,
      name: user.name,
      accountType: user.accountType,
    })

    await setAuthCookie(token)

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user: { id: userId, name: user.name, email: user.email },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

