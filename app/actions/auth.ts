// app/actions/auth.ts
"use server"

import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const COOKIE_NAME = "auth-token"
const ADMIN_COOKIE_NAME = "admin-auth-token"

interface JWTPayload {
  userId: string
  email: string
  role: string
}

// Get current user from cookie
export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get(COOKIE_NAME)?.value || (await cookieStore).get(ADMIN_COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Regular user login
export async function login(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    if (!user) {
      return { success: false, error: "Invalid credentials" }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return { success: false, error: "Invalid credentials" }
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    // Set cookie
    ;(await
          // Set cookie
          cookies()).set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Login failed" }
  }
}

// Admin login
export async function adminLogin(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Invalid admin credentials" }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return { success: false, error: "Invalid credentials" }
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    )

    // Set admin cookie
    ;(await
          // Set admin cookie
          cookies()).set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }
  } catch (error) {
    console.error("Admin login error:", error)
    return { success: false, error: "Admin login failed" }
  }
}

// Regular user registration
export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: "Email already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    // Set cookie
    ;(await
          // Set cookie
          cookies()).set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    return {
      success: true,
      user: newUser,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Registration failed" }
  }
}

// Admin registration
export async function adminRegister(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  adminCode: string
) {
  try {
    const ADMIN_REGISTRATION_CODE = process.env.ADMIN_REGISTRATION_CODE || "ADMIN-SECRET-2024"
    
    if (adminCode !== ADMIN_REGISTRATION_CODE) {
      return { success: false, error: "Invalid admin registration code" }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: "Email already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    return {
      success: true,
      user: newAdmin,
    }
  } catch (error) {
    console.error("Admin registration error:", error)
    return { success: false, error: "Admin registration failed" }
  }
}

// Logout
export async function logout() {
  try {
    (await cookies()).delete(COOKIE_NAME)
    ;(await cookies()).delete(ADMIN_COOKIE_NAME)
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false }
  }
}

// Verify if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

// Verify if user is admin
export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === "ADMIN"
}