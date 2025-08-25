"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Category } from "@/lib/types"

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (category: Omit<Category, "id">) => void
  category?: Category | null
}

export function CategoryFormModal({ isOpen, onClose, onSave, category }: CategoryFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        slug: category.slug,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        slug: "",
      })
    }
  }, [category, isOpen])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.slug.trim()) {
      onSave(formData)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-popover-foreground">
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-popover-foreground">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter category name"
              className="bg-input border-border text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-popover-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter category description"
              className="bg-input border-border text-foreground"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-popover-foreground">
              Slug
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="category-slug"
              className="bg-input border-border text-foreground"
              required
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly version of the name. Auto-generated from name if left empty.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-border bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {category ? "Update" : "Create"} Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
