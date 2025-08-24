"use client"

import { AdminRoute } from "@/components/auth/admin-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Ban, Shield } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { mockUsers } from "@/lib/mock-data"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  joinDate: string
  lastLogin: string
}

const extendedMockUsers: User[] = [
  ...mockUsers.map((user) => ({
    ...user,
    status: "active",
    joinDate: "2024-01-01",
    lastLogin: "2024-01-15",
  })),
  {
    id: "3",
    email: "user1@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "USER",
    status: "active",
    joinDate: "2024-01-05",
    lastLogin: "2024-01-14",
  },
  {
    id: "4",
    email: "user2@example.com",
    firstName: "Mike",
    lastName: "Davis",
    role: "USER",
    status: "inactive",
    joinDate: "2024-01-10",
    lastLogin: "2024-01-12",
  },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(extendedMockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const updateUserRole = (userId: string, newRole: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
  }

  const updateUserStatus = (userId: string, newStatus: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card/50">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">User Management</h1>
              <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-card-foreground">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Users ({filteredUsers.length})</CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-card-foreground">User</th>
                      <th className="text-left py-3 px-4 font-medium text-card-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-card-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-card-foreground">Join Date</th>
                      <th className="text-left py-3 px-4 font-medium text-card-foreground">Last Login</th>
                      <th className="text-left py-3 px-4 font-medium text-card-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-medium text-sm">
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                            {user.role === "ADMIN" && <Shield className="h-3 w-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{user.joinDate}</td>
                        <td className="py-3 px-4 text-muted-foreground">{user.lastLogin}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Select value={user.role} onValueChange={(value) => updateUserRole(user.id, value)}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateUserStatus(user.id, user.status === "active" ? "inactive" : "active")
                              }
                            >
                              {user.status === "active" ? <Ban className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  )
}
