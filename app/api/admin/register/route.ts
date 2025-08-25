// app/api/admin/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

// Define your admin registration code - in production, store this securely
const ADMIN_REGISTRATION_CODE = process.env.ADMIN_REGISTRATION_CODE || "ADMIN-SECRET-2024"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, adminCode } = body

    // Validate input
    if (!email || !password || !firstName || !lastName || !adminCode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Verify admin registration code
    if (adminCode !== ADMIN_REGISTRATION_CODE) {
      return NextResponse.json(
        { error: "Invalid admin registration code" },
        { status: 403 }
      )
    }

    // Check password strength for admin accounts
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters for admin accounts" },
        { status: 400 }
      )
    }

    // Check if password contains at least one number and one special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number and one special character" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12) // Higher salt rounds for admin

    // Create admin user
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "ADMIN", // Set role as ADMIN
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    })

    // Log admin creation for security audit
    console.log(`New admin created: ${newAdmin.email} at ${new Date().toISOString()}`)

    // You might want to send an email notification to existing admins
    // about the new admin registration

    // Generate token (implement your token logic here)
    const token = "GENERATED_TOKEN" // Replace with actual token generation

    // Create response and set cookie
    const response = NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        role: newAdmin.role,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Admin registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}