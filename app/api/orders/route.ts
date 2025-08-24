import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"

// Mock order storage (in production, this would be in a database)
const orders: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const { items, shippingInfo, total } = await request.json()
    const user = getUserFromRequest(request)

    if (!items || !shippingInfo || !total) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create order object
    const order = {
      id: orderId,
      userId: user?.userId || null,
      items,
      shippingInfo,
      total,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store order (in production, save to database)
    orders[orderId] = order

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's orders (in production, query database)
    const userOrders = Object.values(orders).filter((order: any) => order.userId === user.userId)

    return NextResponse.json({ orders: userOrders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
