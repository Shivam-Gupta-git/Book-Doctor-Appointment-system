import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Appointment } from "@/model/appointment.model";
import { getCurrentUser } from "@/lib/auth.lib";
import mongoose from "mongoose";

// POST - Reschedule appointment (user can reschedule their own appointment)
export async function POST(request, { params }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { appointmentDate } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    if (!appointmentDate) {
      return NextResponse.json(
        { success: false, message: "Please provide a new appointment date" },
        { status: 400 }
      );
    }

    // Validate date is in the future
    const newDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate < today) {
      return NextResponse.json(
        { success: false, message: "Please select a future date" },
        { status: 400 }
      );
    }

    await dataBase();
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if user owns this appointment
    if (appointment.userId.toString() !== currentUser.userId) {
      return NextResponse.json(
        { success: false, message: "You can only reschedule your own appointments" },
        { status: 403 }
      );
    }

    // Check if appointment can be rescheduled
    if (appointment.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Cannot reschedule a completed appointment" },
        { status: 400 }
      );
    }

    if (appointment.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Cannot reschedule a cancelled appointment" },
        { status: 400 }
      );
    }

    // Store old date for notes
    const oldDate = appointment.appointmentDate;
    
    // Update appointment date
    appointment.appointmentDate = new Date(appointmentDate);
    // Reset time as admin will need to reassign
    appointment.appointmentTime = "To be assigned";
    // Update status to pending (needs admin confirmation)
    appointment.status = "pending";
    
    // Add note about rescheduling
    const rescheduleNote = `Rescheduled by user on ${new Date().toLocaleString()}. Old date: ${oldDate.toLocaleDateString()}, New date: ${newDate.toLocaleDateString()}`;
    appointment.notes = appointment.notes
      ? `${appointment.notes}\n${rescheduleNote}`
      : rescheduleNote;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(id)
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("doctorId", "firstName lastName email phoneNumber department");

    return NextResponse.json(
      {
        success: true,
        message: "Appointment rescheduled successfully. Admin will assign a new time.",
        appointment: JSON.parse(JSON.stringify(updatedAppointment)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reschedule appointment" },
      { status: 500 }
    );
  }
}

