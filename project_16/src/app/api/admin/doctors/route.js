import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Doctordetails } from "@/model/doctors.model";
import { getCurrentUser } from "@/lib/auth.lib";

// GET - Fetch all doctors
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dataBase();
    const doctors = await Doctordetails.find({}).sort({ createdAt: -1 });
    const doctorsData = JSON.parse(JSON.stringify(doctors));

    return NextResponse.json(
      { success: true, doctors: doctorsData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

// POST - Create new doctor
export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dataBase();
    const body = await request.json();

    // Validation
    const requiredFields = [
      "firstName",
      "gender",
      "age",
      "email",
      "phoneNumber",
      "department",
      "specialization",
      "qualification",
      "experience",
      "availableDays",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingDoctor = await Doctordetails.findOne({ email: body.email });
    if (existingDoctor) {
      return NextResponse.json(
        { success: false, message: "Doctor with this email already exists" },
        { status: 400 }
      );
    }

    // Create doctor
    const doctor = await Doctordetails.create({
      firstName: body.firstName,
      lastName: body.lastName || "",
      gender: body.gender,
      age: body.age,
      email: body.email,
      phoneNumber: body.phoneNumber,
      address: {
        street: body.address?.street || "",
        city: body.address?.city || "",
        state: body.address?.state || "",
        pinCode: body.address?.pinCode || "",
        country: body.address?.country || "",
      },
      department: body.department,
      specialization: Array.isArray(body.specialization)
        ? body.specialization
        : [body.specialization],
      qualification: Array.isArray(body.qualification)
        ? body.qualification
        : [body.qualification],
      experience: body.experience,
      bio: body.bio || "",
      availableDays: Array.isArray(body.availableDays)
        ? body.availableDays
        : [body.availableDays],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Doctor created successfully",
        doctor: JSON.parse(JSON.stringify(doctor)),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating doctor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create doctor" },
      { status: 500 }
    );
  }
}
