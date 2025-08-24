import { type NextRequest, NextResponse } from "next/server"

// Mock order storage (same as in route.ts)
const orders: Record<string, any> = {}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = orders[params.id]

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Order fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
