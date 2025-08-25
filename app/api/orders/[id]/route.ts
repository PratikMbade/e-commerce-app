// app/api/orders/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)

    const order = await prisma.order.findUnique({
      where: {
        id: params.id
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

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Check if user has permission to view this order
    if (user?.userId !== order.userId && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized access to this order" },
        { status: 403 }
      )
    }

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
        description: item.product.description,
        price: item.price.toNumber(),
        quantity: item.quantity,
        image: item.product.image,
        slug: item.product.slug,
        subtotal: item.price.toNumber() * item.quantity
      })),
      user: {
        id: order.user.id,
        email: order.user.email,
        name: `${order.user.firstName} ${order.user.lastName}`
      },
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error("Order fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await  getUserFromRequest(request)
    const { status } = await request.json()

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Check permissions (only order owner or admin can update)
    if (user?.userId !== existingOrder.userId && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized to update this order" },
        { status: 403 }
      )
    }

    // Handle order cancellation - restore stock
    if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Get order items
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: params.id }
        })

        // Restore stock for each item
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          })
        }

        // Update order status
        return await tx.order.update({
          where: { id: params.id },
          data: { status },
          include: {
            orderItems: {
              include: {
                product: true
              }
            }
          }
        })
      })

      return NextResponse.json({
        id: updatedOrder.id,
        status: updatedOrder.status,
        message: "Order cancelled and stock restored"
      })
    }

    // Regular status update
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt.toISOString()
    })
  } catch (error) {
    console.error("Order update error:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)

    // Only admins can delete orders
    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: params.id }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Only allow deletion of cancelled orders
    if (order.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: "Only cancelled orders can be deleted" },
        { status: 400 }
      )
    }

    // Delete order (orderItems will be cascade deleted)
    await prisma.order.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: "Order deleted successfully",
      deletedId: params.id 
    })
  } catch (error) {
    console.error("Order deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    )
  }
}
