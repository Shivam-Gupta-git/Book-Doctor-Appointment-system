import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { User } from "@/model/user.model";
import { Doctordetails } from "@/model/doctors.model";
import { generateToken, setAuthCookie } from "@/lib/auth.lib";

export async function POST(request) {
  try {
    await dataBase();

    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide email and password" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is a doctor
    if (user.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. This is for doctors only.",
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get doctor profile
    const doctor = await Doctordetails.findOne({ userId: user._id });

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    // Set cookie
    setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          doctorId: doctor?._id || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Doctor login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}

