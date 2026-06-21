import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { User } from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Ensure database is connected
    await connectToDatabase()

    const userDoc = await User.findById(user.userId)
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      favorites: userDoc.favorites || [],
      orders: userDoc.orders || [],
      accountType: userDoc.accountType,
      provider: userDoc.provider,
    })
  } catch (error) {
    console.error('[v0] Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
