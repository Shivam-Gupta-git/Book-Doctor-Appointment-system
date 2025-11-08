import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Appointment } from "@/model/appointment.model";
import { getCurrentUser } from "@/lib/auth.lib";

// GET - Fetch all appointments for the current user
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    await dataBase();

    const appointments = await Appointment.find({ userId: currentUser.userId })
      .populate("doctorId", "firstName lastName email phoneNumber department")
      .sort({ createdAt: -1 });

    const appointmentsData = JSON.parse(JSON.stringify(appointments));

    return NextResponse.json(
      { success: true, appointments: appointmentsData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

