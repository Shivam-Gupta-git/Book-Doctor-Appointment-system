import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Doctordetails } from "@/model/doctors.model";
import { getCurrentUser } from "@/lib/auth.lib";

// GET - Fetch doctor's timetable
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

    const doctor = await Doctordetails.findOne({ userId: currentUser.userId });
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    const timetable = doctor.timetable || {};
    const todayTimetable = timetable[today] || null;

    return NextResponse.json(
      {
        success: true,
        timetable: todayTimetable,
        date: today,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching timetable:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}

// PUT - Update doctor's timetable for today
export async function PUT(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login as doctor." },
        { status: 401 }
      );
    }

    await dataBase();

    const body = await request.json();
    const { startTime, endTime, slots } = body;

    // Validation
    if (!startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: "Start time and end time are required" },
        { status: 400 }
      );
    }

    const doctor = await Doctordetails.findOne({ userId: currentUser.userId });
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Initialize timetable if it doesn't exist
    if (!doctor.timetable) {
      doctor.timetable = {};
    }

    // Update today's timetable
    doctor.timetable[today] = {
      startTime,
      endTime,
      slots: slots || [],
    };

    await doctor.save();

    return NextResponse.json(
      {
        success: true,
        message: "Timetable updated successfully",
        timetable: {
          date: today,
          startTime,
          endTime,
          slots: slots || [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating timetable:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update timetable" },
      { status: 500 }
    );
  }
}

