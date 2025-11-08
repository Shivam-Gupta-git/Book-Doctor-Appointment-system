import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Appointment } from "@/model/appointment.model";
import { getCurrentUser } from "@/lib/auth.lib";
import mongoose from "mongoose";

// POST - Cancel appointment (user can cancel their own appointment)
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid appointment ID" },
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
        { success: false, message: "You can only cancel your own appointments" },
        { status: 403 }
      );
    }

    // Check if appointment can be cancelled (not already completed or cancelled)
    if (appointment.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Cannot cancel a completed appointment" },
        { status: 400 }
      );
    }

    if (appointment.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Appointment is already cancelled" },
        { status: 400 }
      );
    }

    // Update appointment status to cancelled
    appointment.status = "cancelled";
    // Add note about cancellation
    const cancellationNote = `Cancelled by user on ${new Date().toLocaleString()}`;
    appointment.notes = appointment.notes
      ? `${appointment.notes}\n${cancellationNote}`
      : cancellationNote;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(id)
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("doctorId", "firstName lastName email phoneNumber department");

    return NextResponse.json(
      {
        success: true,
        message: "Appointment cancelled successfully",
        appointment: JSON.parse(JSON.stringify(updatedAppointment)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}

