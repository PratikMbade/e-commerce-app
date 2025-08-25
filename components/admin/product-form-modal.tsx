"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Product } from "@prisma/client"
import { toast, Toaster } from "sonner"
import { Category } from "@/lib/types"
interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  adminId: string
  onSave: (product: Omit<Product, "id" | "category">) => void
  product?: Product | null
  categories: Category[]
}

export function ProductFormModal({ isOpen, onClose,adminId, onSave, product, categories }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    stock: "",
    featured: false,
    slug: "",
    categoryId: "",
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image: product.image,
        stock: product.stock.toString(),
        featured: product.featured,
        slug: product.slug,
        categoryId: product.categoryId,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        stock: "",
        featured: false,
        slug: "",
        categoryId: "",
      })
    }
  }, [product, isOpen])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug === "" || prev.slug === generateSlug(prev.name) ? generateSlug(value) : prev.slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // store in db also
    if (!adminId) {
      toast.error("Admin ID is required")
      return
    }

    const response = await fetch('/api/products', {
      method: product ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        productSellerId: adminId,
        categorySlug:formData.categoryId,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
      }),
    })

    if (!response.ok) {
      // Handle error
      toast.error("Failed to save product")
      return
    }

    toast.success(`Product ${product ? "updated" : "created"} successfully`)

    if (formData.name.trim() && formData.slug.trim() && formData.price && formData.stock && formData.categoryId) {
      onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number.parseFloat(formData.price),
        image: formData.image.trim() || `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(formData.name)}`,
        stock: Number.parseInt(formData.stock),
        featured: formData.featured,
        slug: formData.slug.trim(),
        categoryId: formData.categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
        productSellerId: adminId
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-popover border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-popover-foreground">{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-popover-foreground">
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter product name"
                className="bg-input border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-popover-foreground">
                Category *
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug} className="text-popover-foreground">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-popover-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              className="bg-input border-border text-foreground"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-popover-foreground">
                Price (₹) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="bg-input border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="text-popover-foreground">
                Stock Quantity *
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
                className="bg-input border-border text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-popover-foreground">
              Image URL
            </Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
              placeholder="https://example.com/image.jpg (optional - will auto-generate if empty)"
              className="bg-input border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-popover-foreground">
              Slug *
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="product-slug"
              className="bg-input border-border text-foreground"
              required
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly version of the name. Auto-generated from name if left empty.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked === true }))}
              className="border-border"
            />
            <Label htmlFor="featured" className="text-popover-foreground text-sm font-medium">
              Featured Product
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-border bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {product ? "Update" : "Create"} Product
            </Button>
          </div>
        </form>
      </DialogContent>
      <Toaster />
    </Dialog>
  )
}
