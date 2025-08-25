"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem } from "@/lib/cart-context"

interface CartItemProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const handleQuantityChange = (change: number) => {
    const newQuantity = item.quantity + change
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      onUpdateQuantity(item.productId, newQuantity)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover rounded-md" />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{item.name}</h3>
            <p className="text-gray-600">Rs: {item.price.toFixed(2)} each</p>
            <p className="text-sm text-gray-500">In stock: {item.stock}</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleQuantityChange(-1)} disabled={item.quantity <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-semibold">{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(1)}
              disabled={item.quantity >= item.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Price and Remove */}
          <div className="text-right">
            <p className="font-bold text-lg">Rs: {(item.price * item.quantity).toFixed(2)}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.productId)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
