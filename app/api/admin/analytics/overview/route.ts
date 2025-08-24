import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = requireAdmin(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Mock analytics data - in production, this would query the database
    const analytics = {
      totalRevenue: 120000,
      totalOrders: 407,
      totalCustomers: 1234,
      totalProducts: 156,
      revenueGrowth: 20.1,
      ordersGrowth: 15.3,
      customersGrowth: 8.2,
      averageOrderValue: 294.84,
      conversionRate: 3.2,
      topSellingProducts: [
        { id: "1", name: "Wireless Headphones", sales: 89, revenue: 26691 },
        { id: "2", name: "Smart Watch", sales: 67, revenue: 26799.33 },
        { id: "4", name: "Running Shoes", sales: 54, revenue: 7019.46 },
        { id: "3", name: "Designer T-Shirt", sales: 43, revenue: 2149.57 },
        { id: "5", name: "Coffee Maker", sales: 31, revenue: 2789.69 },
      ],
      salesByCategory: [
        { category: "Electronics", sales: 45000, percentage: 45 },
        { category: "Clothing", sales: 30000, percentage: 30 },
        { category: "Home & Garden", sales: 15000, percentage: 15 },
        { category: "Sports", sales: 10000, percentage: 10 },
      ],
      monthlySales: [
        { month: "Jan", revenue: 12000, orders: 45, customers: 38 },
        { month: "Feb", revenue: 15000, orders: 52, customers: 44 },
        { month: "Mar", revenue: 18000, orders: 61, customers: 51 },
        { month: "Apr", revenue: 22000, orders: 73, customers: 62 },
        { month: "May", revenue: 25000, orders: 84, customers: 71 },
        { month: "Jun", revenue: 28000, orders: 92, customers: 78 },
      ],
      dailySales: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 2000) + 800,
        orders: Math.floor(Math.random() * 15) + 5,
      })),
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
