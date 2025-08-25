import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FolderOpen, TrendingUp, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "../ui/button"


type Props = {
  adminProducts: number
  adminOutOfStock: number
  adminSales: number
  adminCategoriesLength: number
  adminMonthlyRevenue: number
}
export function DashboardOverview({ adminProducts, adminOutOfStock, adminSales, adminCategoriesLength, adminMonthlyRevenue }: Props) {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your product management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Products",
            value: adminProducts,
            icon: Package,
            description: "Active products in catalog",
          },
          {
            title:"Out Of Stock",
            value: adminOutOfStock,
            icon: Package,
            description: "Products that are out of stock",
          },
          {
            title: "Categories",
            value: adminCategoriesLength,
            icon: FolderOpen,
            description: "Product categories",
          },
          {
            title: "Monthly Sales",
            value: adminSales,
            icon: TrendingUp,
            description: "Units sold this month",
          },
          {
            title: "Monthly Revenue",
            value: adminMonthlyRevenue,
            icon: DollarSign,
            description: "Revenue this month",
          },
        ].map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

    

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-card-foreground mb-2">Manage Categories</h3>
              <p className="text-sm text-muted-foreground mb-3">Create and organize product categories</p>
              <Link href="/admin/categories" className="text-sm text-accent hover:text-accent/80 font-medium">
                <Button>
                  Go to Categories →
                </Button>
              </Link>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-card-foreground mb-2">Manage Products</h3>
              <p className="text-sm text-muted-foreground mb-3">Add, edit, and organize your products</p>
              <Link href="/admin/products" className="text-sm text-accent hover:text-accent/80 font-medium">
                <Button>
                  Go to Products →
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
