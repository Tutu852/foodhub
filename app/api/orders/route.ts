import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { Order } from '@/lib/models/Order'
import { User } from '@/lib/models/User'
import { Food } from '@/lib/models/Food'
import mongoose from 'mongoose'
import { z } from 'zod'
import { isAdmin } from '@/lib/middleware'

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      foodId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
    })
  ),
  totalPrice: z.number().min(0),
  deliveryAddress: z.string().min(5),
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

    const filter = user.accountType === 'Admin' ? {} : { userId: user.userId }
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('[v0] Orders fetch error:', error)
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
    const { items, totalPrice, deliveryAddress } = createOrderSchema.parse(body)

    // Ensure database is connected
    await connectToDatabase()

    // Fetch food details (name, image) to complete the OrderItem fields
    const formattedItems = []
    for (const item of items) {
      const foodDoc = await Food.findById(item.foodId)
      if (!foodDoc) {
        return NextResponse.json(
          { error: `Food item with ID ${item.foodId} not found` },
          { status: 400 }
        )
      }
      formattedItems.push({
        foodId: foodDoc._id,
        foodName: foodDoc.name,
        quantity: item.quantity,
        price: item.price,
        image: foodDoc.image,
      })
    }

    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(user.userId),
      items: formattedItems,
      totalPrice,
      deliveryAddress,
      status: 'pending',
    })

    // Add order reference to user document
    await User.findByIdAndUpdate(user.userId, {
      $push: { orders: order._id }
    })

    return NextResponse.json(
      {
        message: 'Order created successfully',
        orderId: order._id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Create order error:', error)
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

export const PATCH = isAdmin(async (request) => {
  try {
    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    )

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order,
    })
  } catch (error: any) {
    console.error('[v0] Update order status error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
})
