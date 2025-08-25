'use server';

import { prisma } from "@/lib/db"
import { getUserIdFromToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { OrderStatus } from "@prisma/client"

// Helper function to get admin ID from cookies
async function getAdminId() {
  const cookieStore = cookies()
  const token = (await cookieStore).get("auth-token")?.value
  const userId = token ? await getUserIdFromToken(token) : null
  
  if (!userId) return null
  
  // Verify user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  
  if (user?.role !== 'ADMIN') return null
  
  return userId
}

export async function adminLogout() {
  try {
     const currentAdminId = await getAdminId()

  if (!currentAdminId) return false

  // Implement logout logic here
  const cookieStore = cookies();
  (await cookieStore).delete("auth-token");

  return true
  } catch (error) {
    return false
  }
}

// Get admin's current sales (all orders for products sold by admin)
export async function getAdminCurrentSales(adminId?: string) {
  const currentAdminId = adminId || await getAdminId()
  
  if (!currentAdminId) {
    return { totalSales: 0, orderCount: 0, orders: [] }
  }
  
  // Get all orders containing products sold by this admin
  const orders = await prisma.order.findMany({
    where: {
      orderItems: {
        some: {
          product: {
            productSellerId: currentAdminId
          }
        }
      }
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  // Calculate total sales from admin's products only
  const totalSales = orders.reduce((sum, order) => {
    const adminOrderItems = order.orderItems.filter(
      item => item.product.productSellerId === currentAdminId
    )
    const orderTotal = adminOrderItems.reduce(
      (itemSum, item) => itemSum + Number(item.price) * item.quantity,
      0
    )
    return sum + orderTotal
  }, 0)
  
  return {
    totalSales,
    orderCount: orders.length,
    orders
  }
}

// Get admin's current monthly revenue
export async function getAdminMonthlyRevenue(adminId?: string) {
  const currentAdminId = adminId || await getAdminId()
  
  if (!currentAdminId) {
    return { currentMonth: 0, previousMonth: 0, percentageChange: 0, monthlyData: [] }
  }
  
  const now = new Date()
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  
  // Get orders for the last 12 months for chart data
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: twelveMonthsAgo
      },
      orderItems: {
        some: {
          product: {
            productSellerId: currentAdminId
          }
        }
      }
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  })
  
  // Calculate current month revenue
  const currentMonthRevenue = orders
    .filter(order => order.createdAt >= startOfCurrentMonth)
    .reduce((sum, order) => {
      const adminItems = order.orderItems.filter(
        item => item.product.productSellerId === currentAdminId
      )
      return sum + adminItems.reduce(
        (itemSum, item) => itemSum + Number(item.price) * item.quantity,
        0
      )
    }, 0)
  
  // Calculate previous month revenue
  const previousMonthRevenue = orders
    .filter(order => 
      order.createdAt >= startOfPreviousMonth && 
      order.createdAt < startOfCurrentMonth
    )
    .reduce((sum, order) => {
      const adminItems = order.orderItems.filter(
        item => item.product.productSellerId === currentAdminId
      )
      return sum + adminItems.reduce(
        (itemSum, item) => itemSum + Number(item.price) * item.quantity,
        0
      )
    }, 0)
  
  // Calculate percentage change
  const percentageChange = previousMonthRevenue === 0 
    ? 100 
    : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
  
  // Prepare monthly data for charts
  const monthlyData = []
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    
    const monthRevenue = orders
      .filter(order => 
        order.createdAt >= monthStart && 
        order.createdAt < monthEnd
      )
      .reduce((sum, order) => {
        const adminItems = order.orderItems.filter(
          item => item.product.productSellerId === currentAdminId
        )
        return sum + adminItems.reduce(
          (itemSum, item) => itemSum + Number(item.price) * item.quantity,
          0
        )
      }, 0)
    
    monthlyData.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: monthRevenue
    })
  }
  
  return {
    currentMonth: currentMonthRevenue,
    previousMonth: previousMonthRevenue,
    percentageChange: Math.round(percentageChange * 100) / 100,
    monthlyData
  }
}

// Get admin's created products with statistics
export async function getAdminProducts(adminId?: string) {
  const currentAdminId = adminId || await getAdminId()
  
  if (!currentAdminId) {
    return { products: [], totalProducts: 0, featuredCount: 0, outOfStock: 0 }
  }
  
  const products = await prisma.product.findMany({
    where: {
      productSellerId: currentAdminId
    },
    include: {
      category: true,
      orderItems: true,
      cartItems: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  // Calculate statistics
  const totalProducts = products.length
  const featuredCount = products.filter(p => p.featured).length
  const outOfStock = products.filter(p => p.stock === 0).length
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length
  
  // Add sales data to each product
  const productsWithStats = products.map(product => {
    const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    const revenue = product.orderItems.reduce(
      (sum, item) => sum + (Number(item.price) * item.quantity),
      0
    )
    const inCarts = product.cartItems.length
    
    return {
      ...product,
      stats: {
        totalSold,
        revenue,
        inCarts
      }
    }
  })
  
  return {
    products: productsWithStats,
    totalProducts,
    featuredCount,
    outOfStock,
    lowStock
  }
}

// Get all categories (admin can view/manage all categories)
export async function getAdminCategories() {
  const adminId = await getAdminId()
  
  if (!adminId) {
    return { categories: [], totalCategories: 0 }
  }
  
  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: {
          productSellerId: adminId
        },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true
        }
      },
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  // Calculate category statistics
  const categoriesWithStats = categories.map(category => ({
    ...category,
    adminProductCount: category.products.length,
    totalProductCount: category._count.products,
    totalValue: category.products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  }))
  
  return {
    categories: categoriesWithStats,
    totalCategories: categories.length
  }
}

// Create a new category (admin only)
export async function createCategory(data: {
  name: string
  description?: string
  slug: string
}) {
  const adminId = await getAdminId()
  
  if (!adminId) {
    throw new Error("Unauthorized: Admin access required")
  }
  
  return await prisma.category.create({
    data: {
      name: data.name,
      description: data.description,
      slug: data.slug
    }
  })
}

// Get dashboard summary for admin
export async function getAdminDashboardSummary(adminId?: string) {
  const currentAdminId = adminId || await getAdminId()
  
  if (!currentAdminId) {
    return {
      sales: { totalSales: 0, orderCount: 0 },
      revenue: { currentMonth: 0, previousMonth: 0, percentageChange: 0 },
      products: { total: 0, featured: 0, outOfStock: 0 },
      categories: { total: 0 },
      recentOrders: []
    }
  }
  
  // Run all queries in parallel for better performance
  const [sales, revenue, products, categories] = await Promise.all([
    getAdminCurrentSales(currentAdminId),
    getAdminMonthlyRevenue(currentAdminId),
    getAdminProducts(currentAdminId),
    getAdminCategories()
  ])
  
  // Get recent orders (last 5)
  const recentOrders = sales.orders.slice(0, 5).map(order => ({
    id: order.id,
    customer: `${order.user.firstName} ${order.user.lastName}`,
    email: order.user.email,
    total: Number(order.total),
    status: order.status,
    date: order.createdAt,
    itemCount: order.orderItems.length
  }))
  
  return {
    sales: {
      totalSales: sales.totalSales,
      orderCount: sales.orderCount
    },
    revenue: {
      currentMonth: revenue.currentMonth,
      previousMonth: revenue.previousMonth,
      percentageChange: revenue.percentageChange,
      chartData: revenue.monthlyData
    },
    products: {
      total: products.totalProducts,
      featured: products.featuredCount,
      outOfStock: products.outOfStock,
      lowStock: products.lowStock
    },
    categories: {
      total: categories.totalCategories
    },
    recentOrders
  }
}

// Updated main function for your AdminDashboard component
export async function getAdminDashboardData() {
  const cookieStore = cookies()
  const token = (await cookieStore).get("auth-token")?.value
  const userId = token ? await getUserIdFromToken(token) : null
  
  if (!userId) {
    return { 
      products: [], 
      adminId: null,
      dashboardSummary: null 
    }
  }
  
  // Verify admin role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  
  if (user?.role !== 'ADMIN') {
    return { 
      products: [], 
      adminId: null,
      dashboardSummary: null 
    }
  }
  
  const [products, dashboardSummary] = await Promise.all([
    prisma.product.findMany({
      where: {
        productSellerId: userId,
      },
      include: {
        category: true
      }
    }),
    getAdminDashboardSummary(userId)
  ])
  
  return { 
    products, 
    adminId: userId,
    dashboardSummary 
  }
}