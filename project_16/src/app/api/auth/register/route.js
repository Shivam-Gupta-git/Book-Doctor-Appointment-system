import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { User } from "@/model/user.model";
import { generateToken, setAuthCookie } from "@/lib/auth.lib";

export async function POST(request) {
  try {
    await dataBase();

    const body = await request.json();
    const { firstName, lastName, email, password, phoneNumber, role } = body;

    // Validation
    if (!firstName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Please fill all required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role: role || "user",
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    // Set cookie
    setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
