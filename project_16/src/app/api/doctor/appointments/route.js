import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Appointment } from "@/model/appointment.model";
import { Doctordetails } from "@/model/doctors.model";
import { getCurrentUser } from "@/lib/auth.lib";

// GET - Fetch all appointments for the current doctor
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login as doctor." },
        { status: 401 }
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

    // Fetch appointments for this doctor
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("userId", "firstName lastName email phoneNumber")
      .sort({ appointmentDate: -1, createdAt: -1 });

    const appointmentsData = JSON.parse(JSON.stringify(appointments));

    return NextResponse.json(
      { success: true, appointments: appointmentsData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

