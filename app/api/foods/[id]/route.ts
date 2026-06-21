import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { Food } from '@/lib/models/Food'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid food ID' },
        { status: 400 }
      )
    }

    // Ensure database is connected
    await connectToDatabase()

    const food = await Food.findById(id)

    if (!food) {
      return NextResponse.json(
        { error: 'Food not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(food)
  } catch (error) {
    console.error('[v0] Food details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
