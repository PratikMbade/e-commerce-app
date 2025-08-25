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
      setLoading(true)
      if (user) {
        // Load cart from server for authenticated users
        const response = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          // Transform API response to match CartItem interface
          const transformedItems: CartItem[] = (data.items || []).map((item: any) => ({
            id: item.id,
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            quantity: item.quantity,
            stock: item.product.stock,
          }))
          setItems(transformedItems)
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

  const saveCartToLocalStorage = (newItems: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(newItems))
  }

  const addItem = async (product: any, quantity = 1) => {
    try {
      if (user) {
        // Save to server for authenticated user
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
          body: JSON.stringify({ 
            productId: product.id, 
            quantity: quantity,
            action: "add" 
          }),
        })

        if (response.ok) {
          // Reload cart from server to get updated state
          await loadCart()
          addToast("Item added to cart", "success")
        } else {
          const error = await response.json()
          addToast(error.error || "Failed to add item to cart", "error")
        }
      } else {
        // Handle guest user cart
        setItems((prevItems) => {
          const existingItem = prevItems.find((item) => item.productId === product.id)
          let newItems: CartItem[]

          if (existingItem) {
            // Update quantity if item already exists
            const newQuantity = Math.min(existingItem.quantity + quantity, product.stock)
            newItems = prevItems.map((item) => 
              item.productId === product.id 
                ? { ...item, quantity: newQuantity } 
                : item
            )
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

          saveCartToLocalStorage(newItems)
          addToast("Item added to cart", "success")
          return newItems
        })
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error)
      addToast("Failed to add item to cart", "error")
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (user) {
        // Update on server for authenticated user
        const response = await fetch("/api/cart", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
          body: JSON.stringify({ productId, quantity }),
        })

        if (response.ok) {
          // Reload cart from server to get updated state
          await loadCart()
          addToast("Cart updated", "info")
        } else {
          const error = await response.json()
          addToast(error.error || "Failed to update cart", "error")
        }
      } else {
        // Handle guest user cart
        setItems((prevItems) => {
          const newItems = prevItems.map((item) =>
            item.productId === productId 
              ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.stock) } 
              : item
          )
          saveCartToLocalStorage(newItems)
          addToast("Cart updated", "info")
          return newItems
        })
      }
    } catch (error) {
      console.error("Failed to update cart:", error)
      addToast("Failed to update cart", "error")
    }
  }

  const removeItem = async (productId: string) => {
    try {
      if (user) {
        // Remove from server for authenticated user
        const response = await fetch(`/api/cart?productId=${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        })

        if (response.ok) {
          // Reload cart from server to get updated state
          await loadCart()
          addToast("Item removed from cart", "info")
        } else {
          const error = await response.json()
          addToast(error.error || "Failed to remove item", "error")
        }
      } else {
        // Handle guest user cart
        setItems((prevItems) => {
          const newItems = prevItems.filter((item) => item.productId !== productId)
          saveCartToLocalStorage(newItems)
          addToast("Item removed from cart", "info")
          return newItems
        })
      }
    } catch (error) {
      console.error("Failed to remove item:", error)
      addToast("Failed to remove item", "error")
    }
  }

  const clearCart = async () => {
    try {
      if (user) {
        // Clear cart on server for authenticated user
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        })

        if (response.ok) {
          setItems([])
          addToast("Cart cleared", "info")
        } else {
          const error = await response.json()
          addToast(error.error || "Failed to clear cart", "error")
        }
      } else {
        // Handle guest user cart
        setItems([])
        localStorage.removeItem("cart")
        addToast("Cart cleared", "info")
      }
    } catch (error) {
      console.error("Failed to clear cart:", error)
      addToast("Failed to clear cart", "error")
    }
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