import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { User } from "@/model/user.model";
import { Doctordetails } from "@/model/doctors.model";
import { generateToken, setAuthCookie } from "@/lib/auth.lib";

export async function POST(request) {
  // Ensure we always return JSON, even on unexpected errors
  try {
    console.log("Doctor registration request received");
    
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { success: false, message: "Invalid request data. Please check your input." },
        { status: 400 }
      );
    }

    // Connect to database with error handling
    try {
      await dataBase();
      console.log("Database connected");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { success: false, message: "Database connection failed. Please try again later." },
        { status: 500 }
      );
    }

    const { email, password, firstName, lastName, phoneNumber } = body;
    console.log("Registration data:", { email, firstName, hasPassword: !!password });

    // Validation
    if (!email || !password || !firstName) {
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

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Searching for doctor with email:", normalizedEmail);

    // Check if doctor exists in Doctordetails
    // Try exact match first, then case-insensitive
    let existingDoctor = await Doctordetails.findOne({ email: normalizedEmail });
    
    if (!existingDoctor) {
      // Try case-insensitive search
      existingDoctor = await Doctordetails.findOne({ 
        $or: [
          { email: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          { email: email.trim() } // Also try original format
        ]
      });
    }
    
    console.log("Doctor found:", existingDoctor ? "Yes" : "No");
    
    if (!existingDoctor) {
      return NextResponse.json(
        {
          success: false,
          message: `Doctor profile not found with email "${email}". Please contact admin to add your profile first, or check if you entered the correct email address.`,
        },
        { status: 404 }
      );
    }

    // Check if doctor already has an account
    if (existingDoctor.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account already exists. Please login instead.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ 
      $or: [
        { email: normalizedEmail },
        { email: email.trim() }
      ]
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email. Please login instead." },
        { status: 400 }
      );
    }

    // Create user account with doctor role
    console.log("Creating user account...");
    let user;
    try {
      user = await User.create({
        firstName,
        lastName: lastName || existingDoctor.lastName || "",
        email: normalizedEmail,
        password,
        phoneNumber: phoneNumber || existingDoctor.phoneNumber || "",
        role: "doctor",
      });
      console.log("User created successfully:", user._id);
    } catch (createError) {
      console.error("Error creating user:", createError);
      // If it's a validation or duplicate error, let it be handled by the outer catch
      throw createError;
    }

    // Link user to doctor profile
    console.log("Linking user to doctor profile...");
    try {
      existingDoctor.userId = user._id;
      await existingDoctor.save();
      console.log("Doctor profile updated successfully");
    } catch (linkError) {
      console.error("Error linking user to doctor profile:", linkError);
      // If linking fails, we should delete the user to maintain data consistency
      try {
        await User.findByIdAndDelete(user._id);
        console.log("Rolled back user creation due to linking error");
      } catch (rollbackError) {
        console.error("Error rolling back user creation:", rollbackError);
      }
      throw linkError;
    }

    // Generate token
    let token;
    try {
      token = generateToken(user._id.toString(), user.role);
    } catch (tokenError) {
      console.error("Error generating token:", tokenError);
      return NextResponse.json(
        { success: false, message: "Error generating authentication token. Please try again." },
        { status: 500 }
      );
    }

    // Set cookie
    try {
      setAuthCookie(token);
    } catch (cookieError) {
      console.error("Error setting cookie:", cookieError);
      // Don't fail registration if cookie setting fails, just log it
      // The token can still be used via other means
    }

    return NextResponse.json(
      {
        success: true,
        message: "Doctor registration successful",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          doctorId: existingDoctor._id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Doctor registration error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error code:", error.code);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern || {})[0];
      return NextResponse.json(
        { 
          success: false, 
          message: `${field === 'email' ? 'Email' : 'Phone number'} already exists. Please use a different ${field}.` 
        },
        { status: 400 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors || {}).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: errors.length > 0 ? errors.join(', ') : "Validation error. Please check your input." 
        },
        { status: 400 }
      );
    }
    
    // Handle CastError (invalid ObjectId, etc.)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid data format. Please check your input." 
        },
        { status: 400 }
      );
    }
    
    // Handle Mongoose errors
    if (error.name && error.name.startsWith('Mongo')) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Database error occurred. Please try again later." 
        },
        { status: 500 }
      );
    }
    
    // Return more specific error message
    const errorMessage = error.message || "Registration failed. Please try again.";
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

