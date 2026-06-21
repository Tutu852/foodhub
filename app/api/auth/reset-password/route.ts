import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { User } from '@/lib/models/User'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    await connectToDatabase()

    // Find user by token
    const user = await User.findOne({ token })
    if (!user) {
      return NextResponse.json(
        { error: 'Token is invalid' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return NextResponse.json(
        { error: 'Token is expired, please generate a new token' },
        { status: 400 }
      )
    }

    // Hash password and save
    const hashedPassword = await hashPassword(password)
    user.password = hashedPassword
    user.token = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Password reset successful',
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
