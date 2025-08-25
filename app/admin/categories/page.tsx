import { AdminLayout } from "@/components/admin/admin-layout"
import { CategoriesTable } from "@/components/admin/categories-table"

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categories</h1>
            <p className="text-muted-foreground mt-2">Manage your product categories</p>
          </div>
        </div>
        <CategoriesTable />
      </div>
    </AdminLayout>
  )
}
