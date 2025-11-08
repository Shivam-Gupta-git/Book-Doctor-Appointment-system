import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Appointment } from "@/model/appointment.model";
import { User } from "@/model/user.model";
import { Doctordetails } from "@/model/doctors.model";
import { getCurrentUser } from "@/lib/auth.lib";

// GET - Fetch all appointments with user and doctor details
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

    const appointments = await Appointment.find({})
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("doctorId", "firstName lastName email phoneNumber department")
      .sort({ createdAt: -1 });

    const appointmentsData = JSON.parse(JSON.stringify(appointments));

    return NextResponse.json(
      { success: true, appointments: appointmentsData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST - Create new appointment (for users and admins)
export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    await dataBase();
    const body = await request.json();
    const { doctorId, appointmentDate, appointmentTime, reason, notes } = body;

    // Validation
    if (!doctorId || !appointmentDate || !reason) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide doctorId, appointmentDate, and reason",
        },
        { status: 400 }
      );
    }

    // Validate doctor exists
    const doctor = await Doctordetails.findById(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    // Get user details (could be regular user or admin)
    const user = await User.findById(currentUser.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Create appointment with "pending" status by default
    // appointmentTime is optional - admin will set it later
    const appointment = await Appointment.create({
      userId: currentUser.userId,
      doctorId: doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime: appointmentTime || "To be assigned", // Default if not provided
      reason: reason,
      status: "pending", // Default status
      notes: notes || "",
    });

    // Populate appointment with user and doctor details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("userId", "firstName lastName email phoneNumber role")
      .populate("doctorId", "firstName lastName email phoneNumber department");

    const appointmentData = JSON.parse(JSON.stringify(populatedAppointment));

    return NextResponse.json(
      {
        success: true,
        message: "Appointment booked successfully!",
        appointment: appointmentData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create appointment. Please try again.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
