"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Star } from "lucide-react"
import { ProductFormModal } from "@/components/admin/product-form-modal"
import { mockCategories } from "@/lib/mock-data"
import { Category, Product } from "@prisma/client"
import { toast } from "sonner"


export type ProductWithCategory = Product & {
  category: Category;
};
type Props = {
  productsDB: ProductWithCategory[]
  adminId: string
}
export function ProductsTable({ productsDB, adminId }: Props) {
  const [products, setProducts] = useState<ProductWithCategory[]>(
    productsDB.map((product) => {
      const category = mockCategories.find(
        (cat) => cat.slug === product.category.slug
      );

      if (!category) {
        throw new Error(`Category not found for product ${product.name}`);
      }

      return {
        ...product,
        category: {
          ...category,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    }),
  );

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })


      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      const data = await response.json();
      if (data.error) {
        toast.error('something went wrong')
      }
      toast.success('Product deleted successfully')

      setProducts(products.filter((product) => product.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleSaveProduct = (productData: Omit<Product, "id" | "category">) => {
    const category = mockCategories.find((cat) => cat.id === productData.categoryId)

    if (!category) {
      throw new Error(`Category not found for product ${productData.name}`)
    }

    if (editingProduct) {
      // Update existing product in DB and state
      setProducts(
        products.map((product) =>
          product.id === editingProduct.id
            ? {
              ...product,
              ...productData,
              category: {
                ...category,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }
            : product,
        ),
      )
    } else {
      // Add new product
      const newProduct: ProductWithCategory = {
        ...productData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          ...category,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      setProducts([...products, newProduct])
    }

    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-card-foreground">Products List</CardTitle>
          <Button onClick={handleAddProduct} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-card-foreground">Image</TableHead>
                <TableHead className="text-card-foreground">Name</TableHead>
                <TableHead className="text-card-foreground">Description</TableHead>
                <TableHead className="text-card-foreground">Price</TableHead>
                <TableHead className="text-card-foreground">Stock</TableHead>
                <TableHead className="text-card-foreground">Category</TableHead>
                <TableHead className="text-card-foreground">Featured</TableHead>
                <TableHead className="text-card-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 relative rounded-md overflow-hidden bg-muted">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-card-foreground font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{product.description}</TableCell>
                  <TableCell className="text-card-foreground font-mono">{formatPrice(Number(product.price))}</TableCell>
                  <TableCell>
                    <Badge
                      variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                      className={
                        product.stock > 10
                          ? "bg-green-100 text-green-800"
                          : product.stock > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-destructive text-destructive-foreground"
                      }
                    >
                      {product.stock} in stock
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-border text-card-foreground">
                      {product.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        className="border-border hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        adminId={adminId}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={mockCategories}
      />
    </>
  )
}
