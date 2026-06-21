import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { comparePasswords, generateToken, setAuthCookie } from '@/lib/auth'
import { User } from '@/lib/models/User'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Ensure database is connected
    await connectToDatabase()

    // Find user using Mongoose model
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Compare passwords
    const passwordMatch = await comparePasswords(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      accountType: user.accountType,
    })

    // Save token to user document like StudyNotion
    user.token = token
    await user.save()

    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      token,
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        accountType: user.accountType,
      },
    })
  } catch (error) {
    console.error('[v0] Login error:', error)
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
