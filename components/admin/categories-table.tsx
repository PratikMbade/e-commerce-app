"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { CategoryFormModal } from "@/components/admin/category-form-modal"
import { mockCategories } from "@/lib/mock-data"
import type { Category } from "@/lib/types"

export function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleAddCategory = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter((cat) => cat.id !== id))
    }
  }

  const handleSaveCategory = (categoryData: Omit<Category, "id">) => {
    if (editingCategory) {
      // Edit existing category
      setCategories(
        categories.map((cat) => (cat.id === editingCategory.id ? { ...categoryData, id: editingCategory.id } : cat)),
      )
    } else {
      // Add new category
      const newCategory: Category = {
        ...categoryData,
        id: Date.now().toString(),
      }
      setCategories([...categories, newCategory])
    }
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-card-foreground">Categories List</CardTitle>

        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-card-foreground">ID</TableHead>
                <TableHead className="text-card-foreground">Name</TableHead>
                <TableHead className="text-card-foreground">Description</TableHead>
                <TableHead className="text-card-foreground">Slug</TableHead>

              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="text-card-foreground font-mono text-sm">{category.id}</TableCell>
                  <TableCell className="text-card-foreground font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{category.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      {category.slug}
                    </Badge>
                  </TableCell>
       
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCategory(null)
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </>
  )
}
