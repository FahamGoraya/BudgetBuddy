import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { users } from "@/app/db/schema";
import { db } from '@/app/db';
import { eq } from 'drizzle-orm';


const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";



export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email))

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    
    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      avatar: '' + name.charAt(0).toUpperCase(),
      currency: "CAD",
      joinedDate: new Date().toISOString().split("T")[0],
    };

    // Insert new user into the database
    await db.insert(users).values(newUser);
    





    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
