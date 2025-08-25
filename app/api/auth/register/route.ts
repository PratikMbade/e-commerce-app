import { type NextRequest, NextResponse } from "next/server"
import { hashPassword, generateToken } from "@/lib/auth"
import { mockUsers } from "@/lib/mock-data"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // In a real app, this would save to database
    const hashedPassword = await hashPassword(password)
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "USER", // Default role for new users
    }

   // save new user in db

   const saveUser = await prisma.user.create({
    data:{
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "USER", // Default role for new users
    }
   })

   console.log('User saved:', saveUser);

    const token = await generateToken({
      userId: saveUser.id,
      email: saveUser.email,
      role: saveUser.role,
    })

    const response = NextResponse.json({
      user: {
        id: saveUser.id,
        email: saveUser.email,
        firstName: saveUser.firstName,
        lastName: saveUser.lastName,
        role: saveUser.role,
      },
      token,
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
