"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import * as authActions from "@/app/actions/auth"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ success: boolean; error?: string }>
  adminRegister: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    adminCode: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  loading: boolean
  isAdmin: boolean
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const isAdmin = user?.role === "ADMIN"
  const isAuthenticated = !!user

  // Fetch user on mount and refresh
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const currentUser = await authActions.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await authActions.login(email, password)
      
      if (result.success && result.user) {
        setUser(result.user)
        // Refresh the router to update any server components
        router.refresh()
        return { success: true }
      } else {
        return { success: false, error: result.error || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Network error" }
    }
  }

  const adminLogin = async (email: string, password: string) => {
    try {
      const result = await authActions.adminLogin(email, password)
      
      if (result.success && result.user) {
        setUser(result.user)
        router.refresh()
        return { success: true }
      } else {
        return { success: false, error: result.error || "Admin login failed" }
      }
    } catch (error) {
      console.error("Admin login error:", error)
      return { success: false, error: "Network error" }
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const result = await authActions.register(email, password, firstName, lastName)
      
      if (result.success && result.user) {
        setUser(result.user)
        router.refresh()
        return { success: true }
      } else {
        return { success: false, error: result.error || "Registration failed" }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "Network error" }
    }
  }

  const adminRegister = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    adminCode: string
  ) => {
    try {
      const result = await authActions.adminRegister(
        email,
        password,
        firstName,
        lastName,
        adminCode
      )
      
      if (result.success) {
        // Admin registration doesn't auto-login, redirect to login
        return { success: true }
      } else {
        return { success: false, error: result.error || "Admin registration failed" }
      }
    } catch (error) {
      console.error("Admin registration error:", error)
      return { success: false, error: "Network error" }
    }
  }

  const logout = async () => {
    try {
      await authActions.logout()
      setUser(null)
      router.refresh()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        adminLogin,
        register,
        adminRegister,
        logout,
        loading,
        isAdmin,
        isAuthenticated,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}