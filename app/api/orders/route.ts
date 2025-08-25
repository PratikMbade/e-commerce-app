import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { items, shippingInfo, total } = body
    const user = await getUserFromRequest(request)

    // Validate authentication
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid items: must be a non-empty array" },
        { status: 400 }
      )
    }

    if (!shippingInfo || typeof shippingInfo !== 'object') {
      return NextResponse.json(
        { error: "Invalid shipping information" },
        { status: 400 }
      )
    }

    const requiredShippingFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country']
    for (const field of requiredShippingFields) {
      if (!shippingInfo[field]) {
        return NextResponse.json(
          { error: `Missing required shipping field: ${field}` },
          { status: 400 }
        )
      }
    }

    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 }
      )
    }

    // Get product id from cart
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.userId
      }
    })

    items = cartItems.map((item) => ({
      id: item.productId,
      quantity: item.quantity
    }))
    
    // Validate items structure and check product availability
    const productIds = items.map((item: { id: any }) => item.id)
    console.log('Product IDs:', productIds);
    
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    })
    console.log('Found Products:', products);

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Some products not found" },
        { status: 400 }
      )
    }

    // Check stock availability and prepare items with prices
    const itemsWithPrices: any[] = []
    for (const item of items) {
      const product = products.find(p => p.id === item.id)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.id} not found` },
          { status: 400 }
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
          { status: 400 }
        )
      }
      
      // Add price to the item from the product data
      itemsWithPrices.push({
        ...item,
        price: Math.round(product.price) // Convert to integer as per schema
      })
    }

    // Start a transaction to create order and update stock
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: user.userId,
          total: new Prisma.Decimal(total),
          status: 'PENDING',
          shippingName: shippingInfo.fullName,
          shippingEmail: shippingInfo.email,
          shippingAddress: `${shippingInfo.address}, ${shippingInfo.state}`,
          shippingCity: shippingInfo.city,
          shippingZip: shippingInfo.zipCode,
        
          orderItems: {
            create: itemsWithPrices.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price // Now this will have a value
            }))
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
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })

      // Update product stock
      for (const item of itemsWithPrices) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      // Clear user's cart after successful order
      await tx.cartItem.deleteMany({
        where: {
          userId: user.userId
        }
      })

      return newOrder
    })

    // Format response
    const formattedOrder = {
      id: order.id,
      userId: order.userId,
      total: order.total.toNumber(),
      status: order.status,
      shippingInfo: {
        fullName: order.shippingName,
        email: order.shippingEmail,
        address: order.shippingAddress,
        city: order.shippingCity,
        zipCode: order.shippingZip
      },
      items: order.orderItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.image
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }

    return NextResponse.json(formattedOrder, { status: 201 })
  } catch (error) {
    console.error("Order creation error:", error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "Duplicate order detected" },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as any

    // Build where clause
    const where: any = {
      userId: user.userId
    }

    if (status && ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      where.status = status
    }

    // Get total count for pagination
    const totalCount = await prisma.order.count({ where })

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Format response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      total: order.total.toNumber(),
      status: order.status,
      shippingInfo: {
        fullName: order.shippingName,
        email: order.shippingEmail,
        address: order.shippingAddress,
        city: order.shippingCity,
        zipCode: order.shippingZip
      },
      itemCount: order.orderItems.length,
      items: order.orderItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.image,
        slug: item.product.slug
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }))

    return NextResponse.json({ 
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

