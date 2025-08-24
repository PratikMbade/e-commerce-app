"use client"

import { AdminRoute } from "@/components/auth/admin-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, ShoppingCart, Package, DollarSign, TrendingUp, Eye, Settings } from "lucide-react"
import Link from "next/link"

// Mock analytics data
const salesData = [
  { month: "Jan", sales: 12000, orders: 45 },
  { month: "Feb", sales: 15000, orders: 52 },
  { month: "Mar", sales: 18000, orders: 61 },
  { month: "Apr", sales: 22000, orders: 73 },
  { month: "May", sales: 25000, orders: 84 },
  { month: "Jun", sales: 28000, orders: 92 },
]

const categoryData = [
  { name: "Electronics", value: 45, color: "var(--color-chart-1)" },
  { name: "Clothing", value: 30, color: "var(--color-chart-2)" },
  { name: "Home & Garden", value: 15, color: "var(--color-chart-3)" },
  { name: "Sports", value: 10, color: "var(--color-chart-4)" },
]

const recentOrders = [
  { id: "ORD-001", customer: "John Doe", amount: 299.99, status: "completed", date: "2024-01-15" },
  { id: "ORD-002", customer: "Jane Smith", amount: 149.5, status: "processing", date: "2024-01-15" },
  { id: "ORD-003", customer: "Bob Johnson", amount: 89.99, status: "shipped", date: "2024-01-14" },
  { id: "ORD-004", customer: "Alice Brown", amount: 199.99, status: "pending", date: "2024-01-14" },
]

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card/50">
          <div className="flex h-16 items-center px-6">
            <h1 className="text-2xl font-bold text-card-foreground">Admin Dashboard</h1>
            <div className="ml-auto flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">$120,000</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">407</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +15.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">1,234</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +8.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Products</CardTitle>
                <Package className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">156</div>
                <p className="text-xs text-muted-foreground">+3 new products this month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Sales Overview</CardTitle>
                <CardDescription>Monthly sales and order trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sales: {
                      label: "Sales ($)",
                      color: "var(--color-chart-1)",
                    },
                    orders: {
                      label: "Orders",
                      color: "var(--color-chart-2)",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                      <YAxis stroke="var(--color-muted-foreground)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="sales" fill="var(--color-chart-1)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Sales by Category</CardTitle>
                <CardDescription>Product category distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    electronics: {
                      label: "Electronics",
                      color: "var(--color-chart-1)",
                    },
                    clothing: {
                      label: "Clothing",
                      color: "var(--color-chart-2)",
                    },
                    home: {
                      label: "Home & Garden",
                      color: "var(--color-chart-3)",
                    },
                    sports: {
                      label: "Sports",
                      color: "var(--color-chart-4)",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Recent Orders</CardTitle>
                <CardDescription>Latest customer orders and their status</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/orders">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-card-foreground">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-card-foreground">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-card-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-card-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-card-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/50">
                        <td className="py-3 px-4 font-mono text-sm text-foreground">{order.id}</td>
                        <td className="py-3 px-4 text-foreground">{order.customer}</td>
                        <td className="py-3 px-4 font-medium text-foreground">${order.amount}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "processing"
                                  ? "secondary"
                                  : order.status === "shipped"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Manage Products</CardTitle>
                <CardDescription>Add, edit, or remove products from your catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/admin/products">
                    <Package className="h-4 w-4 mr-2" />
                    View Products
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Order Management</CardTitle>
                <CardDescription>Process and track customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/admin/orders">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View Orders
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">User Management</CardTitle>
                <CardDescription>Manage customer accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    View Users
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}
