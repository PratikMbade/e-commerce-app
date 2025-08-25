// app/api/cart/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET: Fetch user's cart with product details
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get cart items with full product details
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            image: true,
            stock: true,
            slug: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            productSeller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate cart summary
    const cartSummary = {
      items: cartItems,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: cartItems.reduce((sum, item) => sum + (item.quantity * item.product.price), 0),
      itemCount: cartItems.length,
    }

    return NextResponse.json(cartSummary)
  } catch (error) {
    console.error("Cart GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Add item to cart or update quantity
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    console.log('User:', user);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request Body:', body);
    const { productId, quantity = 1, action = "add" } = body


    // Validate input
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    if (quantity < 1) {
      return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 })
    }

    const userId = user.userId

    // Check if product exists and has sufficient stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, name: true, price: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check existing cart item
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    })

    let updatedCartItem

    if (action === "set") {
      // Set exact quantity
      if (quantity > product.stock) {
        return NextResponse.json(
          { error: `Only ${product.stock} items available in stock` },
          { status: 400 }
        )
      }

      updatedCartItem = await prisma.cartItem.upsert({
        where: {
          userId_productId: { userId, productId },
        },
        update: {
          quantity,
        },
        create: {
          userId,
          productId,
          quantity,
        },
        include: {
          product: true,
        },
      })
    } else if (action === "add") {
      // Add to existing quantity
      const newQuantity = (existingCartItem?.quantity || 0) + quantity

      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: `Cannot add ${quantity} items. Only ${product.stock - (existingCartItem?.quantity || 0)} more available` },
          { status: 400 }
        )
      }

      updatedCartItem = await prisma.cartItem.upsert({
        where: {
          userId_productId: { userId, productId },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          userId,
          productId,
          quantity,
        },
        include: {
          product: true,
        },
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Get updated cart summary
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    })

    const cartSummary = {
      updatedItem: updatedCartItem,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: cartItems.reduce((sum, item) => sum + (item.quantity * item.product.price), 0),
      itemCount: cartItems.length,
    }

    return NextResponse.json({ success: true, ...cartSummary })
  } catch (error) {
    console.error("Cart POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH: Update cart item quantity
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity } = body

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const userId = user.userId

    // If quantity is 0 or less, remove the item
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: {
          userId_productId: { userId, productId },
        },
      })

      return NextResponse.json({ success: true, message: "Item removed from cart" })
    }

    // Check product stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available in stock` },
        { status: 400 }
      )
    }

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: {
        userId_productId: { userId, productId },
      },
      data: {
        quantity,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json({ success: true, item: updatedCartItem })
  } catch (error) {
    console.error("Cart PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Remove item(s) from cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.userId
    
    // Get productId from URL params if provided
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (productId) {
      // Delete specific item
      await prisma.cartItem.delete({
        where: {
          userId_productId: { userId, productId },
        },
      })

      return NextResponse.json({ 
        success: true, 
        message: "Item removed from cart" 
      })
    } else {
      // Clear entire cart
      const deletedItems = await prisma.cartItem.deleteMany({
        where: { userId },
      })

      return NextResponse.json({ 
        success: true, 
        message: "Cart cleared",
        deletedCount: deletedItems.count
      })
    }
  } catch (error: any) {
    // Handle case where item doesn't exist
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }
    
    console.error("Cart DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}