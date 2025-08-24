"use client"

import { AdminRoute } from "@/components/auth/admin-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Filter, Download, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
  averageOrderValue: number
  conversionRate: number
  topSellingProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  salesByCategory: Array<{
    category: string
    sales: number
    percentage: number
  }>
  monthlySales: Array<{
    month: string
    revenue: number
    orders: number
    customers: number
  }>
  dailySales: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics/overview", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminRoute>
    )
  }

  if (!analytics) {
    return (
      <AdminRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p>Failed to load analytics data</p>
        </div>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card/50">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Sales Analytics</h1>
              <p className="text-sm text-muted-foreground">Comprehensive business insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={fetchAnalytics}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">
                      ${analytics.totalRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />+{analytics.revenueGrowth}% from last
                      month
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">{analytics.totalOrders}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />+{analytics.ordersGrowth}% from last
                      month
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Avg Order Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">
                      ${analytics.averageOrderValue.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Conversion rate: {analytics.conversionRate}%</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">{analytics.totalCustomers}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />+{analytics.customersGrowth}% from
                      last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Revenue Trend</CardTitle>
                    <CardDescription>Monthly revenue and order trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        revenue: {
                          label: "Revenue ($)",
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
                        <AreaChart data={analytics.monthlySales}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                          <YAxis stroke="var(--color-muted-foreground)" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--color-chart-1)"
                            fill="var(--color-chart-1)"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Sales by Category</CardTitle>
                    <CardDescription>Revenue distribution across product categories</CardDescription>
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
                            data={analytics.salesByCategory.map((item, index) => ({
                              ...item,
                              fill: `var(--color-chart-${index + 1})`,
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="sales"
                          >
                            {analytics.salesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`var(--color-chart-${index + 1})`} />
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
                <CardHeader>
                  <CardTitle className="text-card-foreground">Top Selling Products</CardTitle>
                  <CardDescription>Best performing products by sales volume and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-card-foreground">Product</th>
                          <th className="text-left py-3 px-4 font-medium text-card-foreground">Sales</th>
                          <th className="text-left py-3 px-4 font-medium text-card-foreground">Revenue</th>
                          <th className="text-left py-3 px-4 font-medium text-card-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topSellingProducts.map((product, index) => (
                          <tr key={product.id} className="border-b border-border/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-primary font-bold text-sm">{index + 1}</span>
                                </div>
                                <span className="font-medium text-foreground">{product.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-foreground">{product.sales} units</td>
                            <td className="py-3 px-4 font-medium text-foreground">
                              ${product.revenue.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Daily Sales Trend</CardTitle>
                  <CardDescription>Daily revenue and order volume over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue ($)",
                        color: "var(--color-chart-1)",
                      },
                      orders: {
                        label: "Orders",
                        color: "var(--color-chart-2)",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.dailySales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis
                          dataKey="date"
                          stroke="var(--color-muted-foreground)"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis stroke="var(--color-muted-foreground)" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--color-chart-1)"
                          strokeWidth={2}
                          dot={{ fill: "var(--color-chart-1)", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Product Analytics</h3>
                <p className="text-muted-foreground mb-4">Detailed product performance metrics coming soon</p>
                <Button asChild>
                  <Link href="/admin">Back to Dashboard</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Customer Analytics</h3>
                <p className="text-muted-foreground mb-4">Customer behavior and segmentation analysis coming soon</p>
                <Button asChild>
                  <Link href="/admin">Back to Dashboard</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  )
}
