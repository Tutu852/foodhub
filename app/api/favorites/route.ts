import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { User } from '@/lib/models/User'
import mongoose from 'mongoose'
import { z } from 'zod'

const toggleFavoriteSchema = z.object({
  foodId: z.string(),
})

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

    return NextResponse.json({
      favorites: (userDoc?.favorites || []).map((id) => id.toString()),
    })
  } catch (error) {
    console.error('[v0] Favorites fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { foodId } = toggleFavoriteSchema.parse(body)

    // Ensure database is connected
    await connectToDatabase()

    const userDoc = await User.findById(user.userId)
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const favorites = userDoc.favorites || []
    const index = favorites.findIndex((favId) => favId.toString() === foodId)

    if (index > -1) {
      favorites.splice(index, 1)
    } else {
      favorites.push(new mongoose.Types.ObjectId(foodId) as any)
    }

    userDoc.favorites = favorites
    await userDoc.save()

    return NextResponse.json({
      message: 'Favorite updated',
      favorites: favorites.map((id) => id.toString()),
    })
  } catch (error) {
    console.error('[v0] Toggle favorite error:', error)
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
