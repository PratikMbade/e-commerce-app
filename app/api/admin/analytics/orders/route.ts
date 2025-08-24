import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = requireAdmin(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Mock order analytics data
    const orderAnalytics = {
      ordersByStatus: [
        { status: "completed", count: 245, percentage: 60.2 },
        { status: "processing", count: 89, percentage: 21.9 },
        { status: "shipped", count: 52, percentage: 12.8 },
        { status: "pending", count: 21, percentage: 5.1 },
      ],
      ordersByPaymentMethod: [
        { method: "Credit Card", count: 298, percentage: 73.2 },
        { method: "PayPal", count: 67, percentage: 16.5 },
        { method: "Bank Transfer", count: 42, percentage: 10.3 },
      ],
      averageProcessingTime: {
        pending: 2.3,
        processing: 1.8,
        shipped: 3.2,
        delivered: 5.1,
      },
      orderValueDistribution: [
        { range: "$0-$50", count: 89, percentage: 21.9 },
        { range: "$50-$100", count: 134, percentage: 32.9 },
        { range: "$100-$200", count: 98, percentage: 24.1 },
        { range: "$200-$500", count: 67, percentage: 16.5 },
        { range: "$500+", count: 19, percentage: 4.6 },
      ],
      recentOrders: [
        { id: "ORD-001", customer: "John Doe", amount: 299.99, status: "completed", date: "2024-01-15", items: 2 },
        { id: "ORD-002", customer: "Jane Smith", amount: 149.5, status: "processing", date: "2024-01-15", items: 1 },
        { id: "ORD-003", customer: "Bob Johnson", amount: 89.99, status: "shipped", date: "2024-01-14", items: 1 },
        { id: "ORD-004", customer: "Alice Brown", amount: 199.99, status: "pending", date: "2024-01-14", items: 3 },
        {
          id: "ORD-005",
          customer: "Charlie Wilson",
          amount: 449.99,
          status: "completed",
          date: "2024-01-13",
          items: 2,
        },
      ],
    }

    return NextResponse.json(orderAnalytics)
  } catch (error) {
    console.error("Order analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
