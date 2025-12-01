import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Appointment } from "@/model/appointment.model";
import { Doctordetails } from "@/model/doctors.model";
import { getCurrentUser } from "@/lib/auth.lib";
import mongoose from "mongoose";

// PUT - Update appointment status (Doctor only)
export async function PUT(request, { params }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Doctor access required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    await dataBase();

    // Find doctor profile linked to this user
    const doctor = await Doctordetails.findOne({ userId: currentUser.userId });
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Find appointment and verify it belongs to this doctor
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify the appointment belongs to this doctor
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You can only update your own appointments" },
        { status: 403 }
      );
    }

    // Update appointment fields
    if (body.status) {
      // Validate status
      const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid status value" },
          { status: 400 }
        );
      }
      appointment.status = body.status;
    }
    if (body.appointmentTime) {
      appointment.appointmentTime = body.appointmentTime;
    }
    if (body.notes !== undefined) {
      appointment.notes = body.notes;
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(id)
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("doctorId", "firstName lastName email phoneNumber department");

    return NextResponse.json(
      {
        success: true,
        message: "Appointment updated successfully",
        appointment: JSON.parse(JSON.stringify(updatedAppointment)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

