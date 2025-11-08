import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Appointment } from "@/model/appointment.model";
import { getCurrentUser } from "@/lib/auth.lib";
import mongoose from "mongoose";

// GET - Fetch single appointment
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
        { success: false, message: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    await dataBase();
    const appointment = await Appointment.findById(id)
      .populate("userId", "firstName lastName email phoneNumber")
      .populate(
        "doctorId",
        "firstName lastName email phoneNumber department specialization qualification experience"
      );

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, appointment: JSON.parse(JSON.stringify(appointment)) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

// PUT - Update appointment status
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
    const body = await request.json();

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

    // Update appointment fields
    if (body.status) appointment.status = body.status;
    if (body.appointmentDate)
      appointment.appointmentDate = body.appointmentDate;
    if (body.appointmentTime)
      appointment.appointmentTime = body.appointmentTime;
    if (body.reason !== undefined) appointment.reason = body.reason;
    if (body.notes !== undefined) appointment.notes = body.notes;

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

// DELETE - Delete appointment
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
        { success: false, message: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    await dataBase();
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Appointment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
