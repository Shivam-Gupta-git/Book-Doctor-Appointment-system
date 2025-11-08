import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Doctordetails } from "@/model/doctors.model";
import { getCurrentUser } from "@/lib/auth.lib";
import mongoose from "mongoose";

// GET - Fetch single doctor
export async function GET(request, { params }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid doctor ID" },
        { status: 400 }
      );
    }

    await dataBase();
    const doctor = await Doctordetails.findById(id);

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, doctor: JSON.parse(JSON.stringify(doctor)) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctor" },
      { status: 500 }
    );
  }
}

// PUT - Update doctor
export async function PUT(request, { params }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid doctor ID" },
        { status: 400 }
      );
    }

    await dataBase();
    const body = await request.json();

    const doctor = await Doctordetails.findById(id);

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    // Update doctor fields
    if (body.firstName) doctor.firstName = body.firstName;
    if (body.lastName !== undefined) doctor.lastName = body.lastName;
    if (body.gender) doctor.gender = body.gender;
    if (body.age) doctor.age = body.age;
    if (body.email) doctor.email = body.email;
    if (body.phoneNumber) doctor.phoneNumber = body.phoneNumber;
    if (body.department) doctor.department = body.department;
    if (body.specialization)
      doctor.specialization = Array.isArray(body.specialization)
        ? body.specialization
        : [body.specialization];
    if (body.qualification)
      doctor.qualification = Array.isArray(body.qualification)
        ? body.qualification
        : [body.qualification];
    if (body.experience) doctor.experience = body.experience;
    if (body.bio !== undefined) doctor.bio = body.bio;
    if (body.availableDays)
      doctor.availableDays = Array.isArray(body.availableDays)
        ? body.availableDays
        : [body.availableDays];

    // Update address
    if (body.address) {
      if (body.address.street) doctor.address.street = body.address.street;
      if (body.address.city) doctor.address.city = body.address.city;
      if (body.address.state) doctor.address.state = body.address.state;
      if (body.address.pinCode) doctor.address.pinCode = body.address.pinCode;
      if (body.address.country) doctor.address.country = body.address.country;
    }

    await doctor.save();

    return NextResponse.json(
      {
        success: true,
        message: "Doctor updated successfully",
        doctor: JSON.parse(JSON.stringify(doctor)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update doctor" },
      { status: 500 }
    );
  }
}

// DELETE - Delete doctor
export async function DELETE(request, { params }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid doctor ID" },
        { status: 400 }
      );
    }

    await dataBase();
    const doctor = await Doctordetails.findByIdAndDelete(id);

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Doctor deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}
