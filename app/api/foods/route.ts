import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { Food } from '@/lib/models/Food'
import { isAdmin } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Ensure database is connected
    await connectToDatabase()

    const filter: Record<string, any> = {}
    if (category && category !== 'all') {
      filter.category = category
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const foods = await Food.find(filter).limit(50)

    return NextResponse.json(foods)
  } catch (error) {
    console.error('[v0] Foods fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = isAdmin(async (request) => {
  try {
    const { name, description, price, category, image, preparationTime } = await request.json()

    if (!name || !description || price === undefined || !category || !image || preparationTime === undefined) {
      return NextResponse.json(
        { error: 'All fields (name, description, price, category, image, preparationTime) are required.' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const newFood = await Food.create({
      name,
      description,
      price: Number(price),
      category,
      image,
      preparationTime: Number(preparationTime),
      rating: 0,
      reviews: [],
      inStock: true
    })

    return NextResponse.json({
      success: true,
      message: 'Food item added successfully.',
      food: newFood
    })
  } catch (error: any) {
    console.error('Error adding food item:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
})
