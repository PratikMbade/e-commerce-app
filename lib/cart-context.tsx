"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { useToast } from "./toast-context"

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (product: any, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    loadCart()
  }, [user])

  const loadCart = async () => {
    try {
      if (user) {
        // Load cart from server for authenticated users
        const response = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setItems(data.items || [])
        }
      } else {
        // Load cart from localStorage for guest users
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          setItems(JSON.parse(savedCart))
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveCart = async (newItems: CartItem[]) => {
    if (user) {
      // Save to server for authenticated users
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
          body: JSON.stringify({ items: newItems }),
        })
      } catch (error) {
        console.error("Failed to save cart to server:", error)
      }
    } else {
      // Save to localStorage for guest users
      localStorage.setItem("cart", JSON.stringify(newItems))
    }
  }

  const addItem = (product: any, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id)
      let newItems: CartItem[]

      if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock)
        newItems = prevItems.map((item) => (item.productId === product.id ? { ...item, quantity: newQuantity } : item))
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: Math.min(quantity, product.stock),
          stock: product.stock,
        }
        newItems = [...prevItems, newItem]
      }

      saveCart(newItems)
      return newItems
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.stock) } : item,
      )
      saveCart(newItems)
      addToast("Cart updated", "info")
      return newItems
    })
  }

  const removeItem = (productId: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.productId !== productId)
      saveCart(newItems)
      addToast("Item removed from cart", "info")
      return newItems
    })
  }

  const clearCart = () => {
    setItems([])
    if (user) {
      saveCart([])
    } else {
      localStorage.removeItem("cart")
    }
    addToast("Cart cleared", "info")
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
